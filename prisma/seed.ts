import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function main() {
  try {
    const email = process.env.SEED_ADMIN_EMAIL;
    const id = process.env.SEED_ADMIN_ID;

    if (!email || !id) {
      console.log(
        'Skipping admin seed: SEED_ADMIN_EMAIL and SEED_ADMIN_ID required.',
      );
      return;
    }

    if (!UUID_REGEX.test(id)) {
      throw new Error(
        `SEED_ADMIN_ID is not a valid UUID (v1-v5): "${id}". It must match the Supabase auth.users.id of the launch admin.`,
      );
    }

    const profile = await prisma.profile.upsert({
      where: { id },
      update: {
        email,
        role: 'ADMIN',
      },
      create: {
        id,
        email,
        role: 'ADMIN',
        displayName: 'Admin',
      },
    });

    console.log(`Seeded admin profile: ${profile.email} (${profile.id})`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
