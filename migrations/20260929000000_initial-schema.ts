import type { MigrationBuilder } from 'node-pg-migrate';
import { readFileSync } from 'fs';
import { join } from 'path';

const sql = (direction: 'up' | 'down') =>
  readFileSync(
    join(process.cwd(), 'migrations', 'sqls', `20260929000000_initial-schema-${direction}.sql`),
    'utf-8',
  );

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('up'));
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('down'));
}
