require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const newPassword = 'OchiuBeeGo$$$'; // 👈 在這裡輸入你的新密碼
  const hashedPassword = await bcrypt.hash(newPassword, 10);

// 根據 schema.prisma，模型是 Admin，查詢用 username，更新用 passwordHash
  await prisma.admin.update({
    where: { username: 'admin' }, 
    data: { passwordHash: hashedPassword }, // 👈 對應你的資料庫欄位名稱
  });

  console.log('✅ 管理員密碼已成功更新！');
}

main()
  .catch((e) => {
    console.error('❌ 更新失敗：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });