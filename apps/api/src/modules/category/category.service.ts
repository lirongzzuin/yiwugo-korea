import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@common/services/redis.service';

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
}
