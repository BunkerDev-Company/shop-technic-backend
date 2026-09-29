# shop-technic-backend

NestJS + PostgreSQL. Схема БД живёт в SQL-миграциях (node-pg-migrate),
Prisma — только типизированный клиент, схема генерится из живой базы.

## Запуск с нуля

```bash
npm install
cp .env.example .env          # вписать свой DATABASE_URL
npm run db:init               # создать базу, если её нет
npm run migrate:up            # применить миграции (таблицы + стартовый каталог)
npm run prisma:pull           # база -> schema.prisma -> типизированный клиент
npm run start:dev             # http://localhost:3020/api/v1/products
```

## Цикл изменения схемы

1. `npm run migrate:create -- имя-миграции` — создаст обёртку в `migrations/`
2. Рядом положить `migrations/sqls/<timestamp>_имя-up.sql` и `-down.sql`
   (обёртка читает их, см. `20260929000000_initial-schema.ts`)
3. `npm run migrate:up` — применить, `npm run migrate:down` — откатить последнюю
4. `npm run prisma:pull` — обновить `src/infrastructure/prisma/schema.prisma` и клиент

Направление всегда одно: **база → схема → типы**. `schema.prisma` руками не правим.

## Таблицы

- `Category` — разделы каталога
- `Brand` — производители
- `Product` — товар, ссылается на `Category` и `Brand` (FK, ON DELETE RESTRICT)

## Эндпоинт

`GET /api/v1/products?category=phones&brand=apple&q=pro&sort=price_asc&featured=true&page=1&perPage=20`

Путь запроса: `ProductsController` → `ListProductsQuery` → `QueryBus` →
`ListProductsHandler` (Prisma: `findMany` + `include` связей) → `ResponseInterceptor` (конверт `{ data, ... }`).
