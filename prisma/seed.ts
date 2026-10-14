// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log("🚀 開始執行生產環境安全 Seed...");

  // ========== 定向清理：只清商品和優惠碼，絕不碰訂單/用戶/積分 ==========
  await prisma.product.deleteMany();
  console.log("🗑️  已清空舊商品數據");

  await prisma.promoCode.deleteMany();
  console.log("🗑️  已清空舊優惠碼數據");

  // ========== 安全更新管理員（upsert 防止 unique constraint 衝突） ==========
  const adminPassword = "OchiuAdmin2026!";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {
      email: "admin@ochiu.com",
      passwordHash: adminHash,
    },
    create: {
      username: "admin",
      email: "admin@ochiu.com",
      passwordHash: adminHash,
    },
  });
  console.log("✅ 管理員帳號已確保存在 (帳號: admin / 密碼: OchiuAdmin2026!)");

  // ========== 注入最新優惠碼（無門檻） ==========
  await prisma.promoCode.createMany({
    data: [
      {
        code: "OCHIU",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 0,
        expiresAt: new Date("2027-12-31T23:59:59+08:00"),
        isActive: true,
      },
      {
        code: "ARIA",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 0,
        expiresAt: new Date("2027-12-31T23:59:59+08:00"),
        isActive: true,
      },
      {
        code: "CHLOE",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 0,
        expiresAt: new Date("2027-12-31T23:59:59+08:00"),
        isActive: true,
      },
      {
        code: "ICY",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 0,
        expiresAt: new Date("2027-12-31T23:59:59+08:00"),
        isActive: true,
      },
      {
        code: "CRYSTAL",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 0,
        expiresAt: new Date("2027-12-31T23:59:59+08:00"),
        isActive: true,
      },
      {
        code: "LEO",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 0,
        expiresAt: new Date("2027-12-31T23:59:59+08:00"),
        isActive: true,
      },
      {
        code: "BEE",
        discountType: "PERCENTAGE",
        discountValue: 30,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 0,
        expiresAt: new Date("2027-12-31T23:59:59+08:00"),
        isActive: true,
      },
    ],
  });
  console.log("✅ 7 個優惠碼已創建 (OCHIU 10% / ARIA,CHLOE,ICY,CRYSTAL,LEO 20% / BEE 30%)");

  // ========== 讀取並寫入真實商品數據 ==========
  const jsonPath = path.join(__dirname, "realProducts.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const products = JSON.parse(rawData);

  let count = 0;
  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description || "",
        price: product.price,
        originalPrice: product.originalPrice || null,
        category: product.category,
        tag: product.tag || null,
        tags: [],
        material: product.material || null,
        images: product.images || [],
        hoverImage: product.hoverImage || null,
        colors: product.colors || [],
        colorImages: product.colorImages || null,
        sizes: product.sizes || [],
        stock: product.stock || {},
        care: product.care || [],
        details: product.details || [],
        soldCount: 0,
        isActive: true,
      },
    });
    count++;
  }

  console.log(`✅ Seed 完成：已灌入 ${count} 個真實商品`);
}

main()
  .catch((e) => {
    console.error("❌ Seed 執行失敗：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });