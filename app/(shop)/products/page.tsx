import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGridSkeleton } from "@/components/shop/product-card-skeleton";
import { getProducts } from "@/lib/services/product.service";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getT } from "@/lib/server-i18n";

export const metadata: Metadata = {
  title: "Collection",
  description: "Browse our complete jewelry collection.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
    featured?: string;
  }>;
}

async function ProductsGrid({ searchParams }: PageProps) {
  const [params, t] = await Promise.all([searchParams, getT()]);
  const page = parseInt(params.page ?? "1");
  const category = params.category;
  const search = params.search;
  const sort = params.sort as "price_asc" | "price_desc" | "newest" | "name" | undefined;
  const featured = params.featured === "true" ? true : undefined;

  const { products, total, pages } = await getProducts({
    page,
    limit: 12,
    categorySlug: category,
    search,
    sortBy: sort,
    isFeatured: featured,
  });

  const buildUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (p > 1) sp.set("page", String(p));
    if (category) sp.set("category", category);
    if (search) sp.set("search", search);
    if (sort) sp.set("sort", sort);
    if (featured) sp.set("featured", "true");
    return `/products?${sp.toString()}`;
  };

  if (!products.length) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">{t("products.noProducts")}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/products">{t("products.clearFilters")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">
        {t("products.showing", {
          from: String((page - 1) * 12 + 1),
          to: String(Math.min(page * 12, total)),
          total: String(total),
        })}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={page <= 1}
          >
            <Link href={buildUrl(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              {t("products.previous")}
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            {t("products.page", { page: String(page), pages: String(pages) })}
          </span>
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={page >= pages}
          >
            <Link href={buildUrl(page + 1)}>
              {t("products.next")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const [params, t] = await Promise.all([searchParams, getT()]);
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const sortOptions = [
    { value: "newest", label: t("products.newest") },
    { value: "price_asc", label: t("products.priceLowHigh") },
    { value: "price_desc", label: t("products.priceHighLow") },
    { value: "name", label: t("products.nameAZ") },
  ];

  const pageTitle = params.category
    ? categories.find((c) => c.slug === params.category)?.name ?? t("products.collection")
    : params.search
      ? t("products.searchTitle", { query: params.search })
      : params.featured === "true"
        ? t("products.featuredCollection")
        : t("products.ourCollection");

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground">
          {t("products.subtitle")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                {t("products.categories")}
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/products"
                    className={`block text-sm py-1 px-2 rounded transition-colors hover:text-gold-600 ${!params.category ? "text-gold-600 font-medium bg-gold-50 dark:bg-gold-900/20" : "text-muted-foreground"}`}
                  >
                    {t("products.allJewelry")}
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`block text-sm py-1 px-2 rounded transition-colors hover:text-gold-600 ${params.category === cat.slug ? "text-gold-600 font-medium bg-gold-50 dark:bg-gold-900/20" : "text-muted-foreground"}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                {t("products.sortBy")}
              </h3>
              <ul className="space-y-1">
                {sortOptions.map((opt) => (
                  <li key={opt.value}>
                    <Link
                      href={`/products?${params.category ? `category=${params.category}&` : ""}sort=${opt.value}`}
                      className={`block text-sm py-1 px-2 rounded transition-colors hover:text-gold-600 ${params.sort === opt.value || (!params.sort && opt.value === "newest") ? "text-gold-600 font-medium bg-gold-50 dark:bg-gold-900/20" : "text-muted-foreground"}`}
                    >
                      {opt.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductsGrid searchParams={Promise.resolve(params)} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
