import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MeilisearchService } from './meilisearch.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, MeilisearchService],
  exports: [SearchService, MeilisearchService],
})
export class SearchModule {}
