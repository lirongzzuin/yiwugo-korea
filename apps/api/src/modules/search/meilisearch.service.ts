import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index, SearchParams, SearchResponse } from 'meilisearch';

const PRODUCT_INDEX = 'products';

export interface MeiliProductDocument {
  id: string;
  titleKo: string;
  titleOriginal: string;
  descKo?: string;
  shopNameKo?: string;
  shopNameOriginal?: string;
  categoryId?: string;
  priceKrw: number;
  priceOriginalCny: number;
  minOrderQty: number;
  salesCount: number;
  viewCount: number;
  wishlistCount: number;
  reviewCount: number;
  averageRating: number | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  syncedAt: number; // timestamp for sorting
}

export interface MeiliSearchOptions {
  query: string;
  page?: number;
  pageSize?: number;
  filter?: string[];
  sort?: string[];
  facets?: string[];
}

export interface MeiliSearchResult {
  hits: MeiliProductDocument[];
  totalHits: number;
  page: number;
  pageSize: number;
  processingTimeMs: number;
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch;
  private index: Index<MeiliProductDocument>;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>(
      'MEILISEARCH_HOST',
      'http://localhost:7700',
    );
    const apiKey = this.configService.get<string>('MEILISEARCH_API_KEY', '');

    this.client = new MeiliSearch({ host, apiKey });
    this.index = this.client.index(PRODUCT_INDEX);
  }

  async onModuleInit() {
    try {
      // Ensure index exists
      await this.client.createIndex(PRODUCT_INDEX, { primaryKey: 'id' });
      this.logger.log(`Meilisearch index "${PRODUCT_INDEX}" ensured`);
    } catch (error: any) {
      // Index may already exist — that's fine
      if (error.code !== 'index_already_exists') {
        this.logger.warn('Meilisearch index creation warning', error.message);
      }
    }

    // Configure searchable, filterable, sortable attributes
    try {
      await this.index.updateSettings({
        searchableAttributes: [
          'titleKo',
          'titleOriginal',
          'shopNameKo',
          'shopNameOriginal',
          'descKo',
        ],
        filterableAttributes: [
          'categoryId',
          'priceKrw',
          'minOrderQty',
          'isActive',
          'isFeatured',
        ],
        sortableAttributes: [
          'priceKrw',
          'salesCount',
          'viewCount',
          'syncedAt',
        ],
        rankingRules: [
          'words',
          'typo',
          'proximity',
          'attribute',
          'sort',
          'exactness',
        ],
      });
      this.logger.log('Meilisearch settings configured');
    } catch (error) {
      this.logger.warn('Failed to configure Meilisearch settings', error);
    }
  }

  /**
   * Add or update a single product in the index
   */
  async indexProduct(product: MeiliProductDocument): Promise<void> {
    try {
      await this.index.addDocuments([product]);
    } catch (error) {
      this.logger.error(`Failed to index product ${product.id}`, error);
    }
  }

  /**
   * Bulk index products
   */
  async indexProducts(products: MeiliProductDocument[]): Promise<void> {
    if (products.length === 0) return;

    try {
      // Meilisearch handles batches well, but chunk to 1000 docs at a time
      const chunkSize = 1000;
      for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        await this.index.addDocuments(chunk);
        this.logger.log(
          `Indexed ${Math.min(i + chunkSize, products.length)}/${products.length} products`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to bulk index products', error);
      throw error;
    }
  }

  /**
   * Remove a product from the index
   */
  async removeProduct(id: string): Promise<void> {
    try {
      await this.index.deleteDocument(id);
    } catch (error) {
      this.logger.error(`Failed to remove product ${id} from index`, error);
    }
  }

  /**
   * Search products with filters, facets, and sorting
   */
  async search(options: MeiliSearchOptions): Promise<MeiliSearchResult> {
    const {
      query,
      page = 1,
      pageSize = 20,
      filter = [],
      sort = [],
      facets,
    } = options;

    // Always filter for active products
    const allFilters = ['isActive = true', ...filter];

    const searchParams: SearchParams = {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      filter: allFilters,
      sort: sort.length > 0 ? sort : undefined,
      facets: facets,
      attributesToRetrieve: [
        'id',
        'titleKo',
        'titleOriginal',
        'shopNameKo',
        'categoryId',
        'priceKrw',
        'priceOriginalCny',
        'minOrderQty',
        'salesCount',
        'viewCount',
        'imageUrl',
        'isFeatured',
        'averageRating',
      ],
    };

    try {
      const result: SearchResponse<MeiliProductDocument> =
        await this.index.search(query, searchParams);

      return {
        hits: result.hits,
        totalHits:
          typeof result.estimatedTotalHits === 'number'
            ? result.estimatedTotalHits
            : result.hits.length,
        page,
        pageSize,
        processingTimeMs: result.processingTimeMs,
      };
    } catch (error) {
      this.logger.error('Meilisearch search failed', error);
      return {
        hits: [],
        totalHits: 0,
        page,
        pageSize,
        processingTimeMs: 0,
      };
    }
  }

  /**
   * Delete all documents and the index
   */
  async clearIndex(): Promise<void> {
    try {
      await this.index.deleteAllDocuments();
      this.logger.log('Meilisearch index cleared');
    } catch (error) {
      this.logger.error('Failed to clear Meilisearch index', error);
    }
  }
}
