import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || 'toni618';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminPassword) {
    console.log('ADMIN_INITIAL_PASSWORD not set; skipping admin seed. Set it to provision initial admin securely.');
    return;
  }
  if (adminPassword.length < 12) {
    throw new Error('ADMIN_INITIAL_PASSWORD must be at least 12 characters');
  }

  const passwordHash = await argon2.hash(adminPassword);
  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: { role: 'ADMIN', status: 'ACTIVE', passwordHash },
    create: {
      username: adminUsername,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      displayName: 'Administrator',
      preferredLanguage: 'EN',
      profile: { create: { onboardingDone: true, interests: [], personalGoals: [] } },
      preferences: { create: {} },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: 'ADMIN_PROVISIONED',
      entityType: 'User',
      entityId: admin.id,
      metadata: { username: adminUsername, via: 'seed_script' },
    },
  });

  console.log(`Admin user provisioned/verified: ${adminUsername}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
