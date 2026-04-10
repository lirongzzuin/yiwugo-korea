import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@common/services/redis.service';
import { YiwugoApiClient } from '@modules/yiwugo/yiwugo-api.client';

export interface CategoryTreeNode {
  id: string;
  code: string;
  nameZh: string;
  nameKo: string;
  icon: string | null;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children: CategoryTreeNode[];
}

const CACHE_KEY = 'categories:tree';
const CACHE_TTL = 3600; // 1 hour

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly yiwugoApiClient: YiwugoApiClient,
  ) {}

  /**
   * Get all categories as a tree structure (parents with children)
   */
  async getAllCategories(): Promise<CategoryTreeNode[]> {
    // Check cache
    try {
      const cached = await this.redisService.get(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }

    const allCategories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { nameKo: 'asc' }],
    });

    // Build tree
    const categoryMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // First pass: create all nodes
    for (const cat of allCategories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        code: cat.code,
        nameZh: cat.nameZh,
        nameKo: cat.nameKo,
        icon: cat.icon,
        slug: cat.slug,
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        children: [],
      });
    }

    // Second pass: link children to parents
    for (const cat of allCategories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Cache the result
    try {
      await this.redisService.set(CACHE_KEY, JSON.stringify(roots), CACHE_TTL);
    } catch {
      // ignore
    }

    return roots;
  }

  /**
   * Get a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryTreeNode> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { nameKo: 'asc' }],
        },
      },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return {
      id: category.id,
      code: category.code,
      nameZh: category.nameZh,
      nameKo: category.nameKo,
      icon: category.icon,
      slug: category.slug,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      children: category.children.map((child: any) => ({
        id: child.id,
        code: child.code,
        nameZh: child.nameZh,
        nameKo: child.nameKo,
        icon: child.icon,
        slug: child.slug,
        parentId: child.parentId,
        sortOrder: child.sortOrder,
        isActive: child.isActive,
        children: [],
      })),
    };
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<CategoryTreeNode> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { nameKo: 'asc' }],
        },
      },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return {
      id: category.id,
      code: category.code,
      nameZh: category.nameZh,
      nameKo: category.nameKo,
      icon: category.icon,
      slug: category.slug,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      children: category.children.map((child: any) => ({
        id: child.id,
        code: child.code,
        nameZh: child.nameZh,
        nameKo: child.nameKo,
        icon: child.icon,
        slug: child.slug,
        parentId: child.parentId,
        sortOrder: child.sortOrder,
        isActive: child.isActive,
        children: [],
      })),
    };
  }

  /**
   * Get subcategories for a given parent
   */
  async getSubCategories(parentId: string): Promise<CategoryTreeNode[]> {
    const children = await this.prisma.category.findMany({
      where: { parentId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { nameKo: 'asc' }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }],
        },
      },
    });

    return children.map((child: any) => ({
      id: child.id,
      code: child.code,
      nameZh: child.nameZh,
      nameKo: child.nameKo,
      icon: child.icon,
      slug: child.slug,
      parentId: child.parentId,
      sortOrder: child.sortOrder,
      isActive: child.isActive,
      children: child.children.map((sub: any) => ({
        id: sub.id,
        code: sub.code,
        nameZh: sub.nameZh,
        nameKo: sub.nameKo,
        icon: sub.icon,
        slug: sub.slug,
        parentId: sub.parentId,
        sortOrder: sub.sortOrder,
        isActive: sub.isActive,
        children: [],
      })),
    }));
  }

  /**
   * Sync categories from Yiwugo API
   * Fetches top-level and sub-categories, then upserts into database
   */
  async syncFromYiwugo(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    try {
      // Fetch top-level categories (no upperType parameter)
      this.logger.log('Fetching top-level categories from Yiwugo...');
      const topCategories = await this.yiwugoApiClient.getCategories();

      if (!Array.isArray(topCategories)) {
        throw new Error('Invalid categories response');
      }

      // Process each top-level category
      for (const topCat of topCategories) {
        // Extract data from top-level category
        const code = String(topCat.id || topCat.typeId);
        const nameZh = topCat.type || topCat.typename || '';
        const nameEn = topCat.entype || '';
        const slug = this.generateSlug(nameEn || nameZh);
        const icon = topCat.icon || null;
        const sortOrder = topCat.rank || 0;

        // Check if exists before upsert for counting
        const existingTop = await this.prisma.category.findUnique({ where: { code } });

        // Upsert top-level category
        const topResult = await this.prisma.category.upsert({
          where: { code },
          update: {
            nameZh,
            nameKo: nameZh, // Use Chinese name as fallback for Korean
            icon,
            slug,
            sortOrder,
            isActive: true,
          },
          create: {
            code,
            nameZh,
            nameKo: nameZh, // Use Chinese name as fallback for Korean
            icon,
            slug,
            sortOrder,
            isActive: true,
          },
        });

        if (existingTop) updated++;
        else created++;

        this.logger.debug(`Synced top-level category: ${code} (${nameZh})`);

        // Fetch sub-categories for this top-level category
        try {
          this.logger.debug(`Fetching sub-categories for parent: ${code}`);
          const subCategories = await this.yiwugoApiClient.getCategories(code);

          if (!Array.isArray(subCategories)) {
            this.logger.warn(`Invalid sub-categories response for parent: ${code}`);
            continue;
          }

          // Process each sub-category
          for (const subCat of subCategories) {
            const subCode = String(subCat.id || subCat.typeId);
            const subNameZh = subCat.type || subCat.typename || '';
            const subNameEn = subCat.entype || '';
            const subSlug = this.generateSlug(subNameEn || subNameZh);
            const subIcon = subCat.icon || null;
            const subSortOrder = subCat.rank || 0;

            // Check if exists before upsert for counting
            const existingSub = await this.prisma.category.findUnique({ where: { code: subCode } });

            // Upsert sub-category
            await this.prisma.category.upsert({
              where: { code: subCode },
              update: {
                nameZh: subNameZh,
                nameKo: subNameZh, // Use Chinese name as fallback for Korean
                icon: subIcon,
                slug: subSlug,
                parentId: topResult.id,
                sortOrder: subSortOrder,
                isActive: true,
              },
              create: {
                code: subCode,
                nameZh: subNameZh,
                nameKo: subNameZh, // Use Chinese name as fallback for Korean
                icon: subIcon,
                slug: subSlug,
                parentId: topResult.id,
                sortOrder: subSortOrder,
                isActive: true,
              },
            });

            if (existingSub) updated++;
            else created++;

            this.logger.debug(`Synced sub-category: ${subCode} (${subNameZh}) under parent: ${code}`);
          }
        } catch (error) {
          this.logger.error(`Failed to fetch sub-categories for parent: ${code}`, error);
          // Continue with next top-level category
        }
      }

      // Invalidate cache
      await this.invalidateCache();

      this.logger.log(
        `Category sync completed. Created: ${created}, Updated: ${updated}`,
      );
      return { created, updated };
    } catch (error) {
      this.logger.error('Category sync failed', error);
      throw error;
    }
  }

  /**
   * Generate a slug from a name
   * Converts to lowercase and replaces spaces with hyphens
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Invalidate the categories tree cache
   */
  private async invalidateCache(): Promise<void> {
    try {
      await this.redisService.del(CACHE_KEY);
      this.logger.debug('Category cache invalidated');
    } catch {
      // ignore cache errors
    }
  }
}
