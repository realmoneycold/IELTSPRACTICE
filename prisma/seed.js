const { PrismaClient, Role, PartnerStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Clear existing users to ensure clean state
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['ceo@ieltspractice.com', 'admin@ieltspractice.com']
      }
    }
  });

  // Plaintext passwords for local testing only
  const ceoPlainPassword = 'CeoPass123!';
  const adminPlainPassword = 'AdminPass123!';

  const [ceoPasswordHash, adminPasswordHash] = await Promise.all([
    bcrypt.hash(ceoPlainPassword, 10),
    bcrypt.hash(adminPlainPassword, 10),
  ]);

  // 1. CEO Account
  const ceo = await prisma.user.create({
    data: {
      full_name: "CEO Account",
      email: 'ceo@ieltspractice.com',
      password: ceoPasswordHash,
      country: 'Uzbekistan',
      role: Role.CEO,
      is_verified: true,
      current_band: 9.0,
      tasks_done: 0,
    },
  });

  // 2. Admin Account
  const admin = await prisma.user.create({
    data: {
      full_name: "Admin Account",
      email: 'admin@ieltspractice.com',
      password: adminPasswordHash,
      country: 'Uzbekistan',
      role: Role.ADMIN,
      is_verified: true,
      current_band: 8.0,
      tasks_done: 0,
    },
  });

  // Display account information in a table format
  console.log('\n=== ACCOUNT CREDENTIALS ===');
  console.table([
    {
      Role: 'CEO',
      Email: ceo.email,
      Password: ceoPlainPassword,
      FullName: ceo.full_name
    },
    {
      Role: 'ADMIN', 
      Email: admin.email,
      Password: adminPlainPassword,
      FullName: admin.full_name
    }
  ]);
  console.log('=============================\n');

  // Next exam date for dashboard countdown
  const existing = await prisma.examDate.findFirst();
  if (!existing) {
    await prisma.examDate.create({
      data: { date: new Date('2026-06-15'), label: 'June 2026' },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

