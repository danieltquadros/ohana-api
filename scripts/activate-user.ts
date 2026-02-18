import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Uso: npm run ts-script scripts/activate-user.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      status: 'ACTIVE',
      role: 'SUPER_ADMIN',
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Usuário atualizado:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Nome: ${user.firstName} ${user.lastName}`);
  console.log(`   Status: ${user.status}`);
  console.log(`   Role: ${user.role}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
