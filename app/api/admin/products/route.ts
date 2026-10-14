// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'ochiu-admin-secret-key';

const VALID_CATEGORIES = ['tops', 'bottoms', 'outerwear', 'accessories'] as const;

type ColorInput = { name: string; value: string };

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

function buildStockMap(
  colors: ColorInput[],
  sizes: string[],
  stockInput?: Record<string, number>
): Record<string, number> {
  const stock: Record<string, number> = {};
  for (const color of colors) {
    for (const size of sizes) {
      const key = `${color.name}-${size}`;
      const existing = stockInput?.[key];
      stock[key] = typeof existing === 'number' && existing >= 0 ? existing : 0;
    }
  }
  return stock;
}

function parseProductPayload(body: Record<string, unknown>, isCreate: boolean) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const description = typeof body.description === 'string' ? body.description : '';
  const material = typeof body.material === 'string' ? body.material : '';
  const sizeInfo = typeof body.sizeInfo === 'string' ? body.sizeInfo : '';
  const productNo = typeof body.productNo === 'string' ? body.productNo.trim() : '';
  const hoverImage = typeof body.hoverImage === 'string' ? body.hoverImage.trim() : '';

  if (isCreate && !name) {
    throw new Error('請填寫商品名稱');
  }
  if (isCreate && !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    throw new Error('請選擇有效分類');
  }

  const priceHkd = body.priceHkd ?? body.price;
  const price =
    priceHkd !== undefined && priceHkd !== null && priceHkd !== ''
      ? Math.round(Number(priceHkd) * 100)
      : undefined;
  if (price !== undefined && (Number.isNaN(price) || price < 0)) {
    throw new Error('價格無效');
  }

  let originalPrice: number | null | undefined = undefined;
  if (body.originalPriceHkd !== undefined || body.originalPrice !== undefined) {
    // 若明確傳 originalPriceHkd（含 null 表示清空），優先使用；勿用 ?? 否則 null 會誤落到 originalPrice
    const raw =
      body.originalPriceHkd !== undefined ? body.originalPriceHkd : body.originalPrice;
    if (raw === null || raw === '' || raw === undefined) {
      originalPrice = null;
    } else {
      const cents = Math.round(Number(raw) * 100);
      if (Number.isNaN(cents) || cents < 0) throw new Error('原價無效');
      originalPrice = cents;
    }
  }

  let colors: ColorInput[] | undefined;
  if (body.colors !== undefined) {
    if (!Array.isArray(body.colors) || body.colors.length === 0) {
      throw new Error('至少設定一個顏色');
    }
    colors = body.colors.map((c: ColorInput) => ({
      name: String(c.name || '').trim(),
      value: String(c.value || '#000000').trim(),
    }));
    if (colors.some((c) => !c.name)) throw new Error('顏色名稱不可為空');
  }

  let sizes: string[] | undefined;
  if (body.sizes !== undefined) {
    if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
      throw new Error('至少設定一個尺碼');
    }
    sizes = body.sizes.map((s) => String(s).trim()).filter(Boolean);
    if (sizes.length === 0) throw new Error('至少設定一個尺碼');
  }

  let images: string[] | undefined;
  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) throw new Error('圖片格式無效');
    images = body.images.map((img) => String(img).trim()).filter(Boolean);
  }

  let stock: Record<string, number> | undefined;
  if (body.stock !== undefined) {
    if (typeof body.stock !== 'object' || body.stock === null || Array.isArray(body.stock)) {
      throw new Error('庫存格式無效');
    }
    stock = {};
    for (const [key, val] of Object.entries(body.stock as Record<string, unknown>)) {
      stock[key] = Math.max(0, Math.floor(Number(val) || 0));
    }
  }

  let care: string[] | undefined;
  if (body.care !== undefined) {
    care = Array.isArray(body.care)
      ? body.care.map((c) => String(c).trim()).filter(Boolean)
      : String(body.care).split('\n').map((s) => s.trim()).filter(Boolean);
  }

  let details: string[] | undefined;
  if (body.details !== undefined) {
    details = Array.isArray(body.details)
      ? body.details.map((d) => String(d).trim()).filter(Boolean)
      : String(body.details).split('\n').map((s) => s.trim()).filter(Boolean);
  }

  return {
    name: name || undefined,
    category: category || undefined,
    description,
    material,
    sizeInfo,
    productNo: productNo || undefined,
    hoverImage,
    price,
    originalPrice,
    colors,
    sizes,
    images,
    stock,
    care,
    details,
    hemService: typeof body.hemService === 'boolean' ? body.hemService : undefined,
    isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
    isBestSeller: typeof body.isBestSeller === 'boolean' ? body.isBestSeller : undefined,
    isNew: typeof body.isNew === 'boolean' ? body.isNew : undefined,
    tag: body.tag === null || body.tag === '' ? null : (typeof body.tag === 'string' ? body.tag : undefined),
    sizeGuide:
      body.sizeGuide !== undefined && body.sizeGuide !== null && typeof body.sizeGuide === 'object'
        ? body.sizeGuide
        : undefined,
  };
}

const productSelect = {
  id: true,
  productNo: true,
  name: true,
  description: true,
  price: true,
  originalPrice: true,
  category: true,
  tag: true,
  material: true,
  hemService: true,
  sizeInfo: true,
  sizeGuide: true,
  images: true,
  hoverImage: true,
  colors: true,
  colorImages: true,
  sizes: true,
  stock: true,
  care: true,
  details: true,
  soldCount: true,
  isActive: true,
  isBestSeller: true,
  isNew: true,
  createdAt: true,
  updatedAt: true,
} as const;

function formatProduct(p: {
  price: number;
  originalPrice: number | null;
  stock: unknown;
  [key: string]: unknown;
}) {
  const stock = (p.stock as Record<string, number>) || {};
  const stockTotal = Object.values(stock).reduce((sum, v) => sum + (Number(v) || 0), 0);
  return {
    ...p,
    priceHkd: p.price / 100,
    originalPriceHkd: p.originalPrice ? p.originalPrice / 100 : null,
    stockTotal,
  };
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: productSelect,
  });

  return NextResponse.json({
    products: products.map(formatProduct),
  });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = parseProductPayload(body, true);

    const colors = parsed.colors!;
    const sizes = parsed.sizes!;
    const images = parsed.images?.length ? parsed.images : ['/images/testing1.jpeg'];
    const stock = parsed.stock ?? buildStockMap(colors, sizes);

    const created = await prisma.product.create({
      data: {
        name: parsed.name!,
        category: parsed.category!,
        description: parsed.description || '',
        material: parsed.material || null,
        sizeInfo: parsed.sizeInfo || null,
        productNo: parsed.productNo || null,
        price: parsed.price ?? 0,
        originalPrice: parsed.originalPrice ?? null,
        colors,
        colorImages:
          body.colorImages !== undefined && body.colorImages !== null && typeof body.colorImages === 'object'
            ? body.colorImages
            : null,
        sizes,
        stock,
        images,
        hoverImage: parsed.hoverImage || images[1] || images[0],
        care: parsed.care ?? [],
        details: parsed.details ?? [],
        hemService: parsed.hemService ?? false,
        isActive: parsed.isActive ?? true,
        isBestSeller: parsed.isBestSeller ?? false,
        isNew: parsed.isNew ?? false,
        tag: parsed.tag ?? null,
        ...(parsed.sizeGuide !== undefined && { sizeGuide: parsed.sizeGuide }),
      },
      select: productSelect,
    });

    return NextResponse.json({ product: formatProduct(created) });
  } catch (error) {
    const message = error instanceof Error ? error.message : '創建商品失敗';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: '缺少 productId' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const parsed = parseProductPayload(body, false);
    const colors = (parsed.colors ?? existing.colors) as ColorInput[];
    const sizes = parsed.sizes ?? existing.sizes;
    const stock =
      parsed.stock ??
      (parsed.colors || parsed.sizes
        ? buildStockMap(colors, sizes, existing.stock as Record<string, number>)
        : undefined);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(parsed.name && { name: parsed.name }),
        ...(parsed.category && { category: parsed.category }),
        ...(parsed.description !== undefined && { description: parsed.description }),
        ...(parsed.material !== undefined && { material: parsed.material || null }),
        ...(parsed.sizeInfo !== undefined && { sizeInfo: parsed.sizeInfo || null }),
        ...(parsed.productNo !== undefined && { productNo: parsed.productNo || null }),
        ...(parsed.price !== undefined && { price: parsed.price }),
        ...(parsed.originalPrice !== undefined && { originalPrice: parsed.originalPrice }),
        ...(parsed.colors && { colors: parsed.colors }),
        ...(parsed.sizes && { sizes: parsed.sizes }),
        ...(stock && { stock }),
        ...(parsed.images && { images: parsed.images }),
        ...(parsed.hoverImage !== undefined && {
          hoverImage: parsed.hoverImage || parsed.images?.[0] || existing.images[0],
        }),
        ...(parsed.care && { care: parsed.care }),
        ...(parsed.details && { details: parsed.details }),
        ...(parsed.hemService !== undefined && { hemService: parsed.hemService }),
        ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
        ...(parsed.isBestSeller !== undefined && { isBestSeller: parsed.isBestSeller }),
        ...(parsed.isNew !== undefined && { isNew: parsed.isNew }),
        ...(parsed.tag !== undefined && { tag: parsed.tag }),
        ...(parsed.sizeGuide !== undefined && { sizeGuide: parsed.sizeGuide }),
        ...(body.colorImages !== undefined &&
          body.colorImages !== null &&
          typeof body.colorImages === 'object' && { colorImages: body.colorImages }),
      },
      select: productSelect,
    });

    return NextResponse.json({ product: formatProduct(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新商品失敗';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || (await request.json().catch(() => ({}))).productId;

    if (!productId) {
      return NextResponse.json({ error: '缺少 productId' }, { status: 400 });
    }

    const orderItemCount = await prisma.orderItem.count({ where: { productId } });
    if (orderItemCount > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: '商品已有訂單關聯，已改為下架（保留歷史訂單）',
      });
    }

    await prisma.wishlist.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, softDeleted: false, message: '商品已刪除' });
  } catch (error) {
    console.error('刪除商品失敗：', error);
    return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 });
  }
}
