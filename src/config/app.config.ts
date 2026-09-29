import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: parseInt(optional('PORT', '3020'), 10),

  db: {
    url: required('DATABASE_URL'),
  },

  meta: {
    core: optional('APP_CORE_VERSION', '1.0.0'),
    env: optional('NODE_ENV', 'local'),
  },
};
