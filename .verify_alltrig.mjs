import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const rows = await prisma.$queryRaw`
  SELECT c.relname AS table_name,
         t.tgname,
         EXISTS (SELECT 1 FROM information_schema.columns col
                 WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='updated_at') AS has_snake,
         EXISTS (SELECT 1 FROM information_schema.columns col
                 WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='updatedAt') AS has_camel
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_proc p ON p.oid = t.tgfoid
  WHERE p.proname = 'set_updated_at' AND NOT t.tgisinternal
  ORDER BY c.relname
`;
console.table(rows.map(r => ({ table: r.table_name, trigger: r.tgname, snake: r.has_snake, camel: r.has_camel, BROKEN: !r.has_snake })));
await prisma.$disconnect();
