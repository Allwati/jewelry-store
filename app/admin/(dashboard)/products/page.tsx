import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
import { Plus, Edit, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllProductsAdmin } from "@/lib/services/product.service";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { getT } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "Products" };

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const [params, t] = await Promise.all([searchParams, getT()]);
  const page = parseInt(params.page ?? "1");
  const search = params.search ?? undefined;

  const { products, total, pages } = await getAllProductsAdmin(page, 20, search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("adminProducts.title")}</h1>
          <p className="text-muted-foreground">{total} {t("adminOrders.ordersTotal", { total: "" }).replace(" ", "").trim() ? "" : ""}{total} total</p>
        </div>
        <Button variant="gold" asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            {t("adminProducts.addProduct")}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form>
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder={t("adminProducts.searchPlaceholder")}
            className="ps-9"
          />
        </div>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-muted/30">
              <tr>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminProducts.productCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminProducts.priceCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminProducts.stockCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminProducts.statusCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.ordersCol", { total: "" }) ? t("adminOrders.title") : "Orders"}</th>
                <th className="text-end px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminProducts.actionsCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {products.map((product) => {
                const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
                return (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {primaryImage && (
                            <Image src={primaryImage.url} alt={product.title} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.category.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{formatPrice(Number(product.discountedPrice ?? product.price))}</p>
                        {product.discountedPrice && (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(Number(product.price))}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stockQuantity === 0 ? "text-red-500" : product.stockQuantity < 5 ? "text-yellow-500" : "text-green-600"}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.isAvailable ? "success" : "secondary"} className="text-xs w-fit">
                          {product.isAvailable ? "Available" : "Hidden"}
                        </Badge>
                        {product.isFeatured && (
                          <Badge variant="gold" className="text-xs w-fit">{t("adminProducts.featured")}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{product._count.orderItems}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!products.length && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t("adminProducts.noProducts")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" asChild>
              <Link href={`/admin/products?page=${i + 1}${search ? `&search=${search}` : ""}`}>{i + 1}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
