// lib/order-payment.ts
import { prisma } from '@/lib/prisma';
import { sendPaymentReceiptEmail } from '@/lib/email';
import { applyUserRewardsForOrder } from '@/lib/member-rewards';

/**
 * 付款成功統一處理邏輯
 * 
 * 被 Stripe Webhook 和 /api/checkout/verify 共用
 * 內建冪等性保護：如果訂單已非 pending_payment 狀態，直接跳過
 */
export async function handlePaymentSuccess(orderId: string, paymentId: string): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. 獲取訂單及其商品
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order || order.status !== 'pending_payment') {
        // 冪等性保護：已處理過的訂單直接跳過
        return;
      }

      // 2. 原子扣減庫存 + 防超賣
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`商品不存在：${item.productId}`);
        }

        const stock = product.stock as Record<string, number>;
        const key = `${item.color}-${item.size}`;
        const currentStock = stock[key] || 0;

        if (currentStock < item.quantity) {
          throw new Error(
            `庫存不足：${product.name}（${item.color}/${item.size}）剩餘 ${currentStock}，需要 ${item.quantity}`
          );
        }

        stock[key] = currentStock - item.quantity;

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock,
            soldCount: { increment: item.quantity },
          },
        });
      }

      // 3. 更新訂單狀態為已支付
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paymentId: paymentId,
        },
      });

      // 4. 記錄時間線事件
      await tx.orderEvent.create({
        data: {
          orderId,
          status: 'paid',
          label: '支付成功',
          description: '已收到您的付款，訂單正在處理中',
        },
      });

      // 5. 為用戶累積積分 + 會員晉升檢查（冪等）
      await applyUserRewardsForOrder(tx, { ...order, status: 'paid' });
    }, {
      timeout: 15000,
      maxWait: 10000,
    });

    // 事務成功後，發送收款憑證郵件
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order && order.status === 'paid') {
      await sendPaymentReceiptEmail({
        orderNumber: order.orderNumber,
        email: order.email,
        shippingName: order.shippingName,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingDistrict: order.shippingDistrict,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.memberDiscount + order.discount,
        totalAmount: order.totalAmount,
        items: order.items.map((item) => ({
          name: item.name,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      console.log(`✅ 訂單 ${order.orderNumber} 支付成功，庫存已原子扣減，會員檢查完成，收款憑證已發送`);
    }
  } catch (error) {
    console.error('處理支付成功失敗：', error);
    throw error;
  }
}