import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const req = await prisma.prayerRequest.findUnique({
  where: { id: '00e53052-370b-4648-a2e6-c586dc4a7ccb' },
  select: { title: true, prayerCount: true },
});
console.log('DB prayerCount:', JSON.stringify(req));
const intercessions = await prisma.prayerIntercession.findMany({
  where: { prayerRequestId: '00e53052-370b-4648-a2e6-c586dc4a7ccb' },
  select: { userId: true, createdAt: true },
});
console.log('intercessions:', JSON.stringify(intercessions, null, 1));
const notifs = await prisma.notification.findMany({
  where: { title: 'Someone prayed for you' },
  orderBy: { createdAt: 'desc' },
  take: 2,
  select: { userId: true, title: true, createdAt: true },
});
console.log('notifications:', JSON.stringify(notifs, null, 1));
await prisma.$disconnect();
