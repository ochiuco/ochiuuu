import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates = [
  { name: "復古玫瑰提花彎刀褲", productNo: "OC00001", hemService: true },
  { name: "美式破洞水洗七分", productNo: "OC00002", hemService: true },
  { name: "花花蕾丝短袖", productNo: "OC00003", hemService: false },
  { name: "米白短款皮衣外套", productNo: "OC00004", hemService: false },
  { name: "韓系波點花苞蓬蓬半身裙", productNo: "OC00005", hemService: true },
  { name: "淺灰貓紋牛仔短褲", productNo: "OC00006", hemService: false },
  { name: "短款麻質連衣裙", productNo: "OC00007", hemService: false },
  { name: "波點半袖娃娃袖襯衣", productNo: "OC00008", hemService: true },
  { name: "高腰闊腿西褲", productNo: "OC00009", hemService: true },
  { name: "薄身西裝褲", productNo: "OC00010", hemService: true },
  { name: "絲綢半身長裙", productNo: "OC00011", hemService: true },
  { name: "緞面側邊蕾絲裙", productNo: "OC00012", hemService: true },
  { name: "斜肩帶扣上衣", productNo: "OC00013", hemService: false },
];

async function main() {
  console.log("🔄 更新 OC00001~OC00013 的 productNo 和 hemService...\n");

  for (const item of updates) {
    const product = await prisma.product.findFirst({
      where: { name: { contains: item.name } },
    });

    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          productNo: item.productNo,
          hemService: item.hemService,
        },
      });
      console.log(`  ✅ ${item.productNo} - ${product.name} (hemService: ${item.hemService})`);
    } else {
      console.log(`  ⚠️ 找不到: ${item.name}`);
    }
  }

  console.log("\n🎉 完成！");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());