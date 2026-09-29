import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma Migrate не используем: схемой управляют SQL-миграции (node-pg-migrate),
// Prisma только читает базу (db pull) и генерит клиент.
export default defineConfig({
  schema: 'src/infrastructure/prisma/schema.prisma',
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
