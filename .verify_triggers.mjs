import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const triggers = await prisma.$queryRaw`
  SELECT t.tgname, p.proname, pg_get_functiondef(p.oid) AS def
  FROM pg_trigger t
  JOIN pg_proc p ON p.oid = t.tgfoid
  WHERE t.tgrelid = 'public.prayer_requests'::regclass AND NOT t.tgisinternal
`;
for (const tr of triggers) {
  console.log('=== trigger:', tr.tgname, '-> fn:', tr.proname, '===');
  console.log(tr.def);
}
await prisma.$disconnect();
