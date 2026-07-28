import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const reqs = await prisma.prayerRequest.findMany({
  where: { status: { in: ['APPROVED', 'ANSWERED'] }, visibility: { in: ['PUBLIC', 'ANONYMOUS'] } },
  orderBy: { createdAt: 'desc' },
  select: { id: true, title: true, prayerCount: true, status: true, authorId: true },
  take: 5,
});
console.log('approved requests:', JSON.stringify(reqs, null, 1));

const tester = await prisma.profile.findFirst({
  where: { email: 'claude.verify.tester@lightbearers.local' },
  select: { id: true, email: true, role: true },
});
console.log('tester profile:', JSON.stringify(tester));

if (tester) {
  const mine = await prisma.prayerIntercession.findMany({
    where: { userId: tester.id },
    select: { id: true, prayerRequestId: true, createdAt: true },
  });
  console.log('tester intercessions:', JSON.stringify(mine, null, 1));
}
await prisma.$disconnect();
