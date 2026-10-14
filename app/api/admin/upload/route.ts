import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { authenticateAdmin } from '@/lib/admin-auth';
import {
  buildProductImagePath,
  getNextProductImageFilename,
  guessExtension,
  normalizeProductNo,
  validateImageFile,
} from '@/lib/product-image-upload';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          '尚未配置 BLOB_READ_WRITE_TOKEN。請在 Vercel 項目 Storage 中建立 Blob Store，並新增環境變數後重新部署。',
      },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const productNoRaw = formData.get('productNo');
    const productNo =
      typeof productNoRaw === 'string' ? normalizeProductNo(productNoRaw) : '';

    if (!productNo || !/^OC\d{4,6}$/i.test(productNo)) {
      return NextResponse.json(
        { error: '請先填寫有效的商品編號（格式如 OC00024）' },
        { status: 400 }
      );
    }

    let existingUrls: string[] = [];
    const existingRaw = formData.get('existingUrls');
    if (typeof existingRaw === 'string' && existingRaw.trim()) {
      try {
        const parsed = JSON.parse(existingRaw);
        if (Array.isArray(parsed)) {
          existingUrls = parsed.filter((u) => typeof u === 'string');
        }
      } catch {
        return NextResponse.json({ error: 'existingUrls 格式無效' }, { status: 400 });
      }
    }

    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      const single = formData.get('file');
      if (single instanceof File && single.size > 0) {
        files.push(single);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: '請選擇要上傳的圖片' }, { status: 400 });
    }

    const uploaded: { url: string; pathname: string; filename: string }[] = [];
    const workingUrls = [...existingUrls];

    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      const ext = guessExtension(file.name, file.type);
      const filename = getNextProductImageFilename(productNo, workingUrls, ext);
      const pathname = buildProductImagePath(productNo, filename);

      let blob;
      try {
        blob = await put(pathname, file, {
          access: 'public',
          addRandomSuffix: false,
          contentType: file.type,
        });
      } catch (putError) {
        const msg = putError instanceof Error ? putError.message : '';
        if (msg.includes('private store') || msg.includes('private access')) {
          return NextResponse.json(
            {
              error:
                '目前 Blob Store 為 Private 模式，無法上傳公開商品圖。請在 Vercel → Storage → 該 Blob Store → Settings 改為 Public，或新建 Public Blob Store 並更新 BLOB_READ_WRITE_TOKEN 後重新部署。',
            },
            { status: 503 }
          );
        }
        throw putError;
      }

      uploaded.push({ url: blob.url, pathname: blob.pathname, filename });
      workingUrls.push(blob.url);
    }

    return NextResponse.json({
      success: true,
      urls: uploaded.map((item) => item.url),
      files: uploaded,
    });
  } catch (error) {
    console.error('圖片上傳失敗：', error);
    const message = error instanceof Error ? error.message : '上傳失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
