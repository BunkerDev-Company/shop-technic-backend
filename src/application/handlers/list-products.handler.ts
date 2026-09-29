import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { ListProductsQuery, ProductSort } from '../queries/list-products.query';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  popular:    [{ rating_count: 'desc' }, { title: 'asc' }],
  price_asc:  [{ price: 'asc' }],
  price_desc: [{ price: 'desc' }],
  new:        [{ date_create_at: 'desc' }],
};

@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<ListProductsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(q: ListProductsQuery) {
    // Фильтр по связанной таблице пишется как вложенный объект —
    // Prisma сама построит JOIN по внешнему ключу.
    const where: Prisma.ProductWhereInput = { is_active: true };
    if (q.category) where.Category = { slug: q.category };
    if (q.brand)    where.Brand    = { slug: q.brand };
    if (q.featured) where.is_featured = true;
    if (q.query?.trim()) {
      where.title = { contains: q.query.trim(), mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { Category: true, Brand: true },
        orderBy: ORDER_BY[q.sort] ?? ORDER_BY.popular,
        skip:    (q.page - 1) * q.perPage,
        take:    q.perPage,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: products.map((p) => {
        // NUMERIC приходит как Prisma.Decimal — в JSON отдаём число.
        const price = Number(p.price.toString());
        return {
          id:          p.id,
          slug:        p.slug,
          title:       p.title,
          subtitle:    p.subtitle,
          brand:       { slug: p.Brand.slug, title: p.Brand.title },
          category:    { slug: p.Category.slug, title: p.Category.title },
          imageUrl:    p.image_url,
          priceMin:    price,
          priceMax:    price,
          rating:      Number(p.rating.toString()),
          ratingCount: p.rating_count,
          inStock:     p.stock_qty > 0,
        };
      }),
      page:       q.page,
      perPage:    q.perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / q.perPage)),
    };
  }
}
