// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentReceiptEmail, sendPickupReadyEmail, sendSFShippedEmail } from '@/lib/email';
import { handlePaymentSuccess } from '@/lib/order-payment';
import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'ochiu-admin-secret-key';

function verifyAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.substring(7);
  try {
    jwt.verify(token, ADMIN_JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

/**
 * 判斷訂單配送方式是否為「門市自取」
 */
function isPickupMethod(shippingMethod: string): boolean {
  if (!shippingMethod) return false;
  const normalized = shippingMethod.toLowerCase().trim();
  return (
    normalized === 'pickup' ||
    normalized === 'store_pickup' ||
    normalized === 'self_pickup' ||
    normalized === 'self-pickup' ||
    normalized.includes('自取') ||
    normalized.includes('門市')
  );
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  // 構建查詢條件
  const where: Record<string, unknown> = {};
  if (status) {
    // 支持 ready_for_pickup 狀態篩選
    where.status = status;
  }
  if (search && search.trim()) {
    where.orderNumber = { contains: search.trim(), mode: 'insensitive' };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, status, trackingNumber } = body;

  if (!orderId || !status) {
    return NextResponse.json(
      { error: '缺少 orderId 或 status' },
      { status: 400 }
    );
  }

  // 構建更新數據
  const updateData: Record<string, unknown> = { status };

  // 當狀態為 shipped 時，同時保存物流單號
  if (status === 'shipped' && trackingNumber) {
    updateData.trackingNumber = trackingNumber;
  }

  // 專業狀態標籤
  const statusLabels: Record<string, string> = {
    pending_payment: '訂單建立',
    paid: '付款成功',
    processing: '備貨中',
    ready_for_pickup: '訂單已備妥',
    shipped: '包裹已發出',
    in_transit: '運送中',
    delivered: '已送達',
    completed: '已完成',
    cancelled: '訂單已取消',
  };

  // 專業物流文案（面向用戶的友好描述）
  const getTimelineDescription = (
    newStatus: string,
    tn?: string,
    shippingMethod?: string
  ): string | undefined => {
    const isPickup = shippingMethod ? isPickupMethod(shippingMethod) : false;

    switch (newStatus) {
      case 'paid':
        return '您的付款已確認成功，我們正在為您安排備貨出庫。';
      case 'processing':
        return '倉庫正在為您揀貨並精心打包，請耐心等候發貨通知。';
      case 'ready_for_pickup':
        return '您的訂單已準備就緒，可隨時來店取貨。取貨地址：荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房';
      case 'shipped':
        if (isPickup) {
          return '您的訂單已準備就緒，可隨時來店取貨。取貨地址：荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房';
        }
        return tn
          ? `您的包裹已交由順豐速運處理，正在為您派送中。順豐單號：${tn}`
          : '您的包裹已打包發出，正前往您的收件地址，請留意近期物流電話/短訊通知。';
      case 'in_transit':
        return '您的包裹正在運輸途中，預計即將送達。';
      case 'delivered':
        if (isPickup) {
          return '您已成功取貨，感謝您的購買！如有任何問題歡迎聯繫客服。';
        }
        return '您的包裹已成功送達，感謝您的購買！如有任何問題歡迎聯繫客服。';
      case 'completed':
        return '訂單已完成，期待下次為您服務。';
      case 'cancelled':
        return '此訂單已取消處理。如有疑問請隨時聯繫我們的客服團隊。';
      default:
        return undefined;
    }
  };

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 管理員確認付款：走統一支付成功流程（扣庫存、積分、會員晉升、收據郵件）
    if (status === 'paid' && existingOrder.status === 'pending_payment') {
      await handlePaymentSuccess(orderId, `admin-confirmed-${Date.now()}`);
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      return NextResponse.json(order);
    }

    // 更新訂單狀態（及物流單號）
    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    });

    // 取得訂單的配送方式
    const shippingMethod = (order as any).shippingMethod || '';
    const isPickup = isPickupMethod(shippingMethod);

    // 確定 timeline label
    const timelineLabel = statusLabels[status] || status;

    // 創建時間線事件（面向用戶的專業文案）
    await prisma.orderEvent.create({
      data: {
        orderId,
        status,
        label: timelineLabel,
        description: getTimelineDescription(status, trackingNumber, shippingMethod),
      },
    });

    // ============ 自動發送郵件邏輯 ============

    // 當狀態更新為 paid 時，自動發送收據郵件（admin 確認付款已由 handlePaymentSuccess 處理）
    if (status === 'paid' && existingOrder.status !== 'pending_payment' && order.email) {
      try {
        await sendPaymentReceiptEmail({
          orderNumber: order.orderNumber,
          email: order.email,
          shippingName: order.shippingName || '',
          shippingAddress: order.shippingAddress || '',
          shippingCity: order.shippingCity || '',
          shippingDistrict: order.shippingDistrict || null,
          paymentMethod: order.paymentMethod || '',
          subtotal: order.subtotal || 0,
          shippingFee: order.shippingFee || 0,
          discount: order.discount || 0,
          totalAmount: order.totalAmount,
          items: order.items.map((item: any) => ({
            name: item.name,
            color: item.color,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          })),
        });
      } catch (emailError) {
        console.error('自動發送收據郵件失敗：', emailError);
      }
    }

    // 當狀態更新為 ready_for_pickup 時，自動發送綠色主題門市自取通知郵件
    if (status === 'ready_for_pickup' && order.email) {
      try {
        await sendPickupReadyEmail(
          order.email,
          order.orderNumber,
          order.shippingName || ''
        );
      } catch (emailError) {
        console.error('自動發送門市自取通知郵件失敗：', emailError);
        // 郵件發送失敗不影響訂單狀態更新
      }
    }

    // 當狀態更新為 shipped 時，自動發送藍色主題順豐發貨通知郵件
    if (status === 'shipped' && order.email) {
      try {
        const tn = trackingNumber || (order as any).trackingNumber || '';
        await sendSFShippedEmail(
          order.email,
          order.orderNumber,
          order.shippingName || '',
          tn
        );
      } catch (emailError) {
        console.error('自動發送順豐發貨通知郵件失敗：', emailError);
        // 郵件發送失敗不影響訂單狀態更新
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: '更新訂單失敗' },
      { status: 500 }
    );
  }
}