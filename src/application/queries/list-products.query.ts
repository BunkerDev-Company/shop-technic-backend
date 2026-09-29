export type ProductSort = 'popular' | 'price_asc' | 'price_desc' | 'new';

/**
 * Витрина: только активные товары, с серверной пагинацией.
 * category / brand — slug справочника, q — поиск по названию.
 */
export class ListProductsQuery {
  constructor(
    public readonly page:      number = 1,
    public readonly perPage:   number = 20,
    public readonly sort:      ProductSort = 'popular',
    public readonly category?: string,
    public readonly brand?:    string,
    public readonly query?:    string,
    public readonly featured?: boolean,
  ) {}
}
