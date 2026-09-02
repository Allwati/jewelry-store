import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Zap, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/product.service";
import { formatPrice, getDiscountPercent, getDirectOrderUrl } from "@/lib/utils";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { CopyLinkButton } from "@/components/shop/copy-link-button";
import { getT } from "@/lib/server-i18n";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  return {
    title: product.title,
    description: product.shortDescription ?? product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription ?? product.description.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage.url }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, t] = await Promise.all([getProductBySlug(slug), getT()]);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4);

  const price = Number(product.discountedPrice ?? product.price);
  const originalPrice = Number(product.price);
  const hasDiscount = product.discountedPrice && Number(product.discountedPrice) < originalPrice;
  const directOrderUrl = getDirectOrderUrl(product.slug);
  const isOutOfStock = product.stockQuantity === 0;

  const stockLabel = isOutOfStock
    ? t("productDetail.outOfStock")
    : product.stockQuantity < 5
      ? t("productDetail.onlyLeft", { count: String(product.stockQuantity) })
      : t("productDetail.inStock");

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">{t("productDetail.home")}</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground transition-colors">{t("productDetail.collection")}</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{product.category.name}</Badge>
              {product.isFeatured && (
                <Badge variant="gold" className="text-xs">{t("productDetail.featured")}</Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary" className="text-xs">{t("productDetail.outOfStock")}</Badge>
              )}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold leading-tight">{product.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(price)}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
                <Badge variant="destructive">
                  {t("productDetail.save", { percent: String(getDiscountPercent(originalPrice, Number(product.discountedPrice))) })}
                </Badge>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          )}

          <Separator />

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isOutOfStock ? "bg-red-500" : product.stockQuantity < 5 ? "bg-yellow-500" : "bg-green-500"}`} />
            <span className="text-sm">{stockLabel}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <AddToCartButton product={product} />
            <Button size="lg" variant="outline" className="flex-1" asChild>
              <Link href={`/buy/${product.slug}`}>
                <Zap className="h-4 w-4" />
                {t("productDetail.buyNow")}
              </Link>
            </Button>
          </div>

          {/* Direct Order Link */}
          <div className="rounded-lg border border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/10 p-4">
            <p className="text-sm font-medium mb-2">{t("productDetail.directOrderLink")}</p>
            <p className="text-xs text-muted-foreground mb-3">{t("productDetail.directOrderLinkDesc")}</p>
            <div className="flex gap-2">
              <code className="flex-1 text-xs bg-background rounded px-2 py-1.5 border truncate">
                {directOrderUrl}
              </code>
              <CopyLinkButton url={directOrderUrl} label={t("productDetail.copy")} />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            {product.material && (
              <div className="flex gap-3">
                <span className="text-muted-foreground w-24 flex-shrink-0">{t("productDetail.material")}</span>
                <span>{product.material}</span>
              </div>
            )}
            {product.weight && (
              <div className="flex gap-3">
                <span className="text-muted-foreground w-24 flex-shrink-0">{t("productDetail.weight")}</span>
                <span>{product.weight}g</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex gap-3">
                <span className="text-muted-foreground w-24 flex-shrink-0">{t("productDetail.dimensions")}</span>
                <span>{product.dimensions}</span>
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-gold-500" />
              <span>{t("productDetail.certifiedAuthentic")}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="h-3.5 w-3.5 text-gold-500" />
              <span>{t("productDetail.freeShipping")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12">
        <h2 className="font-serif text-xl font-bold mb-4">{t("productDetail.description")}</h2>
        <div className="prose prose-stone dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-bold mb-6">{t("productDetail.youMayAlsoLike")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
