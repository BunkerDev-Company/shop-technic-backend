-- =====================================================
-- EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CATEGORY
-- Разделы каталога: смартфоны, ноутбуки и т.д.
-- slug — человекочитаемый ключ для URL (?category=phones).
-- =====================================================

CREATE TABLE "Category"
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    sort_order      INTEGER      NOT NULL DEFAULT 0,
    date_create_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_update_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BRAND
-- Производители. Справочник, на который ссылается товар.
-- =====================================================

CREATE TABLE "Brand"
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    date_create_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_update_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT
-- Товар. Две связи «многие к одному»:
--   Product.category_id -> Category.id
--   Product.brand_id    -> Brand.id
-- ON DELETE RESTRICT: нельзя удалить категорию/бренд,
-- пока на них ссылается хотя бы один товар.
-- =====================================================

CREATE TABLE "Product"
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     UUID          NOT NULL,
    brand_id        UUID          NOT NULL,

    slug            VARCHAR(150)  NOT NULL UNIQUE,
    title           VARCHAR(255)  NOT NULL,
    subtitle        VARCHAR(255),
    description     TEXT,
    image_url       VARCHAR(500),

    price           NUMERIC(12,2) NOT NULL,
    stock_qty       INTEGER       NOT NULL DEFAULT 0,
    rating          NUMERIC(2,1)  NOT NULL DEFAULT 0,
    rating_count    INTEGER       NOT NULL DEFAULT 0,

    is_featured     BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    date_create_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_update_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES "Category"(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_product_brand
        FOREIGN KEY (brand_id)
        REFERENCES "Brand"(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_product_price     CHECK (price >= 0),
    CONSTRAINT chk_product_stock_qty CHECK (stock_qty >= 0)
);

CREATE INDEX idx_product_category ON "Product"(category_id);
CREATE INDEX idx_product_brand    ON "Product"(brand_id);

-- Частичный индекс: в него попадают только витринные товары.
-- Prisma Migrate такое не опишет — одна из причин писать SQL руками.
CREATE INDEX idx_product_featured ON "Product"(date_create_at DESC)
    WHERE is_featured = TRUE AND is_active = TRUE;

-- =====================================================
-- SEED
-- Стартовый каталог, чтобы витрина сразу была живой.
-- Картинки лежат во фронтенде: public/products/*.svg
-- =====================================================

INSERT INTO "Category" (slug, title, sort_order) VALUES
    ('phones',  'Смартфоны', 1),
    ('laptops', 'Ноутбуки',  2),
    ('tablets', 'Планшеты',  3),
    ('audio',   'Наушники',  4),
    ('watches', 'Часы',      5);

INSERT INTO "Brand" (slug, title) VALUES
    ('apple',   'Apple'),
    ('samsung', 'Samsung'),
    ('xiaomi',  'Xiaomi'),
    ('sony',    'Sony'),
    ('asus',    'ASUS');

-- Внешние ключи подставляем подзапросом по slug: id — UUID,
-- заранее он неизвестен.
INSERT INTO "Product"
    (category_id, brand_id, slug, title, subtitle, image_url, price, stock_qty, rating, rating_count, is_featured)
SELECT c.id, b.id, p.slug, p.title, p.subtitle, p.image_url, p.price, p.stock_qty, p.rating, p.rating_count, p.is_featured
FROM (VALUES
    ('phones',  'apple',   'iphone-15-pro',         'iPhone 15 Pro',            '128 ГБ, титан',          '/products/iphone-15-pro.svg',         109990, 12, 4.9, 214, TRUE),
    ('phones',  'samsung', 'galaxy-s24',            'Galaxy S24',               '256 ГБ, чёрный',         '/products/galaxy-s24.svg',             79990,  8, 4.7, 156, TRUE),
    ('phones',  'xiaomi',  'xiaomi-14',             'Xiaomi 14',                '256 ГБ, зелёный',        '/products/xiaomi-14.svg',              64990,  0, 4.6,  87, FALSE),
    ('laptops', 'apple',   'macbook-air-13-m3',     'MacBook Air 13" M3',       '8/256 ГБ, серебристый',  '/products/macbook-air-13-m3.svg',     129990,  5, 4.9, 132, TRUE),
    ('laptops', 'asus',    'asus-rog-zephyrus-g14', 'ROG Zephyrus G14',         'Ryzen 9, RTX 4060',      '/products/asus-rog-zephyrus-g14.svg', 159990,  3, 4.8,  64, FALSE),
    ('tablets', 'apple',   'ipad-air-11',           'iPad Air 11"',             'M2, 128 ГБ, Wi-Fi',      '/products/ipad-air-11.svg',            69990,  7, 4.8,  98, TRUE),
    ('audio',   'apple',   'airpods-pro-2',         'AirPods Pro 2',            'USB-C',                  '/products/airpods-pro-2.svg',          24990, 20, 4.8, 341, TRUE),
    ('audio',   'sony',    'sony-wh-1000xm5',       'WH-1000XM5',               'Шумоподавление, чёрные', '/products/sony-wh-1000xm5.svg',        34990,  9, 4.9, 176, TRUE),
    ('watches', 'apple',   'apple-watch-s9',        'Apple Watch Series 9',     '45 мм, алюминий',        '/products/apple-watch-s9.svg',         44990,  6, 4.7, 120, FALSE),
    ('watches', 'samsung', 'galaxy-watch-6',        'Galaxy Watch 6',           '44 мм, графит',          '/products/galaxy-watch-6.svg',         27990,  4, 4.5,  73, FALSE)
) AS p (category_slug, brand_slug, slug, title, subtitle, image_url, price, stock_qty, rating, rating_count, is_featured)
JOIN "Category" c ON c.slug = p.category_slug
JOIN "Brand"    b ON b.slug = p.brand_slug;
