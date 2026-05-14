import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Diamond, Shield, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug } from "@/lib/services/product.service";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { DirectOrderForm } from "@/components/shop/direct-order-form";
import { getT } from "@/lib/server-i18n";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Order - Product Not Found" };

  return {
    title: `Order ${product.title}`,
    description: `Order ${product.title} directly — no account required.`,
    robots: { index: false },
  };
}

export default async function DirectBuyPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, t] = await Promise.all([getProductBySlug(slug), getT()]);
  if (!product || !product.isAvailable) notFound();

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const price = Number(product.discountedPrice ?? product.price);
  const originalPrice = Number(product.price);
  const hasDiscount = product.discountedPrice && Number(product.discountedPrice) < originalPrice;

  const stockLabel = product.stockQuantity === 0
    ? t("buyPage.outOfStock")
    : product.stockQuantity < 5
      ? t("buyPage.onlyLeft", { count: String(product.stockQuantity) })
      : t("buyPage.inStock");

  const trustBadges = [
    { icon: Shield, text: t("buyPage.secureOrdering") },
    { icon: Truck, text: t("buyPage.freeShipping") },
    { icon: Diamond, text: t("buyPage.certifiedAuthentic") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Diamond className="h-5 w-5 text-gold-500" />
            <span className="font-serif text-xl font-bold">Lumière Jewelry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("buyPage.completeOrder")}</h1>
          <p className="text-muted-foreground">{t("buyPage.noAccountRequired")}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Product Summary */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-background rounded-2xl border border-border/50 overflow-hidden shadow-sm">
              <div className="relative aspect-square">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    {t("buyPage.noImage")}
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-3 start-3">
                    <Badge variant="destructive">
                      -{getDiscountPercent(originalPrice, Number(product.discountedPrice))}%
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5">
                <Badge variant="outline" className="text-xs mb-2">{product.category.name}</Badge>
                <h2 className="font-semibold text-lg leading-tight mb-1">{product.title}</h2>
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground mb-3">{product.shortDescription}</p>
                )}

                <Separator className="my-3" />

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatPrice(price)}</span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
                  )}
                </div>

                {product.material && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("buyPage.material", { value: product.material })}
                  </p>
                )}

                <div className={`mt-3 flex items-center gap-1.5 text-xs ${product.stockQuantity === 0 ? "text-red-500" : product.stockQuantity < 5 ? "text-yellow-500" : "text-green-500"}`}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  {stockLabel}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-background rounded-xl border border-border/50 p-4 space-y-3">
              {trustBadges.map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-gold-500 flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Form */}
          <div className="md:col-span-3">
            <DirectOrderForm
              productId={product.id}
              productSlug={product.slug}
              productTitle={product.title}
              price={price}
              maxQuantity={product.stockQuantity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
