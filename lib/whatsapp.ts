// lib/whatsapp.ts

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * 清洗香港手機號碼，確保格式為 852XXXXXXXX
 */
function formatHKPhoneNumber(phone: string): string {
  // 移除所有非數字字符
  let cleaned = phone.replace(/[^0-9]/g, '');

  // 如果以 852 開頭且長度正確，直接返回
  if (cleaned.startsWith('852') && cleaned.length === 11) {
    return cleaned;
  }

  // 如果是 8 位數字（香港本地號碼），補上 852
  if (cleaned.length === 8) {
    return `852${cleaned}`;
  }

  // 如果以 852 開頭（其他長度），嘗試截取後 8 位
  if (cleaned.startsWith('852') && cleaned.length > 11) {
    return cleaned.slice(0, 11);
  }

  // 其他情況，嘗試補上 852
  return `852${cleaned}`;
}

interface WhatsAppMessageData {
  phone: string;
  orderNumber: string;
  totalAmount: number; // 分為單位
  paymentMethod: 'fps' | 'payme';
}

/**
 * 透過 WhatsApp Business API 發送付款二維碼消息
 * 
 * 環境變量要求：
 * - WHATSAPP_TOKEN: Meta Graph API 的 Bearer Token
 * - WHATSAPP_PHONE_NUMBER_ID: 商用 WhatsApp 號碼 ID
 * - FPS_QR_IMAGE_URL: FPS 收款碼圖片的公開 URL
 * - PAYME_QR_IMAGE_URL: PayMe 收款碼圖片的公開 URL
 */
export async function sendPaymentQRCodeViaWhatsApp(data: WhatsAppMessageData): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('⚠️ WhatsApp API 環境變量未設置 (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID)，跳過發送');
    return;
  }

  const recipientPhone = formatHKPhoneNumber(data.phone);
  const amountDisplay = `HK$ ${(data.totalAmount / 100).toFixed(2)}`;

  // 根據付款方式選擇二維碼圖片 URL
  const qrImageUrl = data.paymentMethod === 'fps'
    ? (process.env.FPS_QR_IMAGE_URL || '')
    : (process.env.PAYME_QR_IMAGE_URL || '');

  const paymentMethodLabel = data.paymentMethod === 'fps' ? '轉數快 (FPS)' : 'PayMe';

  try {
    // Step 1: 發送文字消息（問候語 + 訂單資訊）
    const textBody = [
      `您好！🙌`,
      ``,
      `感謝您在 O'CHIU 下單！`,
      ``,
      `📦 訂單編號：${data.orderNumber}`,
      `💰 支付金額：${amountDisplay}`,
      `💳 支付方式：${paymentMethodLabel}`,
      ``,
      `請掃描下方收款二維碼完成付款（30 分鐘內有效）。`,
      `付款成功後系統將自動更新您的訂單狀態。`,
      ``,
      `如有問題歡迎直接回覆此消息 ❤️`,
    ].join('\n');

    const textRes = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: textBody,
        },
      }),
    });

    if (!textRes.ok) {
      const errBody = await textRes.text();
      console.error('WhatsApp 文字消息發送失敗：', textRes.status, errBody);
    }

    // Step 2: 發送二維碼圖片媒體消息
    if (qrImageUrl) {
      const imgRes = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'image',
          image: {
            link: qrImageUrl,
            caption: `${paymentMethodLabel} 收款碼 - 訂單 ${data.orderNumber} - ${amountDisplay}`,
          },
        }),
      });

      if (!imgRes.ok) {
        const errBody = await imgRes.text();
        console.error('WhatsApp 圖片消息發送失敗：', imgRes.status, errBody);
      }
    } else {
      console.warn(`⚠️ 未設置 ${data.paymentMethod === 'fps' ? 'FPS_QR_IMAGE_URL' : 'PAYME_QR_IMAGE_URL'} 環境變量，跳過二維碼圖片發送`);
    }

    console.log(`✅ WhatsApp 付款碼已發送至 +${recipientPhone}`);
  } catch (error) {
    console.error('WhatsApp 消息發送失敗：', error);
    // WhatsApp 發送失敗不影響訂單流程
  }
}