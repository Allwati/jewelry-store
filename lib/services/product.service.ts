import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type RawProductWithImages = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: true;
  };
}>;

export type ProductWithImages = Omit<
  RawProductWithImages,
  "price" | "discountedPrice"
> & {
  price: number;
  discountedPrice: number | null;
};

function serialize<T extends { price: { toNumber(): number }; discountedPrice: { toNumber(): number } | null }>(
  product: T
): Omit<T, "price" | "discountedPrice"> & { price: number; discountedPrice: number | null } {
  return {
    ...product,
    price: product.price.toNumber(),
    discountedPrice: product.discountedPrice?.toNumber() ?? null,
  };
}

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    search,
    isFeatured,
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
    sortBy = "newest",
  } = filters;

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    isAvailable: true,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (isFeatured !== undefined) where.isFeatured = isFeatured;
  if (minPrice !== undefined) where.price = { gte: minPrice };
  if (maxPrice !== undefined) {
    where.price = {
      ...(typeof where.price === "object" ? where.price : {}),
      lte: maxPrice,
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sortBy === "price_asc"
      ? { price: "asc" }
      : sortBy === "price_desc"
        ? { price: "desc" }
        : sortBy === "name"
          ? { title: "asc" }
          : { createdAt: "desc" };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    products: products.map(serialize),
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
  return product ? serialize(product) : null;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
  return product ? serialize(product) : null;
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true, deletedAt: null },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(serialize);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      isAvailable: true,
      deletedAt: null,
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    take: limit,
  });
  return products.map(serialize);
}

export async function createProduct(
  data: Prisma.ProductCreateInput & {
    images?: Array<{
      url: string;
      publicId?: string;
      altText?: string;
      isPrimary?: boolean;
      sortOrder?: number;
    }>;
  }
) {
  const { images, ...productData } = data;
  const product = await prisma.product.create({
    data: {
      ...productData,
      images: images
        ? {
            create: images,
          }
        : undefined,
    },
    include: { images: true, category: true },
  });
  return serialize(product);
}

export async function updateProduct(
  id: string,
  data: Prisma.ProductUpdateInput
) {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: { images: true, category: true },
  });
  return serialize(product);
}

export async function softDeleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getAllProductsAdmin(
  page = 1,
  limit = 20,
  search?: string
) {
  const where: Prisma.ProductWhereInput = { deletedAt: null };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { products: products.map(serialize), total, pages: Math.ceil(total / limit), page };
}
