#!/usr/bin/env tsx
/**
 * Creates the PostgreSQL database if it does not exist.
 * Run once before the first migration: npm run db:init
 */

import 'dotenv/config';
import { Client } from 'pg';

function parseDbName(url: string): { adminUrl: string; dbName: string } {
  const u = new URL(url);
  const dbName = u.pathname.replace('/', '');
  u.pathname = '/postgres'; // connect to default db to create the target one
  return { adminUrl: u.toString(), dbName };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const { adminUrl, dbName } = parseDbName(databaseUrl);

  console.log(`Initializing database "${dbName}"...\n`);

  const client = new Client({ connectionString: adminUrl });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    const { rows } = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (rows.length > 0) {
      console.log(`Database "${dbName}" already exists`);
    } else {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created`);
    }

    console.log('\nRun migrations:\n  npm run migrate:up\n');
  } catch (err) {
    console.error('\nError:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
