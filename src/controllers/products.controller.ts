import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListProductsQuery, ProductSort } from '../application/queries/list-products.query';

const SORTS: ProductSort[] = ['popular', 'price_asc', 'price_desc', 'new'];

function toPositiveInt(value: string | undefined, fallback: number, max: number): number {
  const n = parseInt(value ?? '', 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly queryBus: QueryBus) {}

  // -- GET /products ------------------------------------------------------
  // Каталог витрины. ?category=phones&brand=apple&q=pro&sort=price_asc
  // &featured=true&page=1&perPage=20
  @Get()
  list(
    @Query('page')     page?:     string,
    @Query('perPage')  perPage?:  string,
    @Query('sort')     sort?:     string,
    @Query('category') category?: string,
    @Query('brand')    brand?:    string,
    @Query('q')        query?:    string,
    @Query('featured') featured?: string,
  ) {
    return this.queryBus.execute(
      new ListProductsQuery(
        toPositiveInt(page, 1, 10_000),
        toPositiveInt(perPage, 20, 100),
        SORTS.includes(sort as ProductSort) ? (sort as ProductSort) : 'popular',
        category || undefined,
        brand || undefined,
        query || undefined,
        featured === 'true',
      ),
    );
  }
}
