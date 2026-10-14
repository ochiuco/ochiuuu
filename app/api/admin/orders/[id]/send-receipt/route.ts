// app/api/admin/orders/[id]/send-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentReceiptEmail } from '@/lib/email';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (!order.email) {
      return NextResponse.json({ error: '該訂單沒有關聯的電郵地址' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, message: '收據郵件已發送' });
  } catch (error) {
    console.error('手動發送收據郵件失敗：', error);
    return NextResponse.json({ error: '發送郵件失敗' }, { status: 500 });
  }
}