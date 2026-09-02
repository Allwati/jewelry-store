import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Diamond, Shield, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { getFeaturedProducts } from "@/lib/services/product.service";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/server-i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lumière Jewelry - Timeless Elegance",
  description:
    "Discover our exquisite collection of handcrafted jewelry. From diamond engagement rings to pearl necklaces.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [featuredProducts, categories, t] = await Promise.all([
    getFeaturedProducts(8),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
    }),
    getT(),
  ]);

  const trustBadges = [
    { icon: Shield, titleKey: "home.certifiedQualityTitle", descKey: "home.certifiedQualityDesc" },
    { icon: Truck, titleKey: "home.freeShippingTitle", descKey: "home.freeShippingDesc" },
    { icon: RotateCcw, titleKey: "home.returnsTitle", descKey: "home.returnsDesc" },
    { icon: Diamond, titleKey: "home.warrantyTitle", descKey: "home.warrantyDesc" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1920"
            alt="Jewelry background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container relative py-24 md:py-36 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-sm text-gold-300 mb-6 animate-fade-in">
            <Diamond className="h-3.5 w-3.5" />
            <span>{t("home.badge")}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in">
            {t("home.heroTitle")}{" "}
            <span className="text-gold-400">{t("home.heroHighlight")}</span>
          </h1>
          <p className="text-lg text-stone-300 max-w-2xl mb-8 animate-fade-in">
            {t("home.heroDesc")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
            <Button size="xl" variant="gold" asChild>
              <Link href="/products">
                {t("home.shopCollection")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/products?featured=true">{t("home.viewFeatured")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((item) => (
              <div
                key={item.titleKey}
                className="flex items-center gap-3 text-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 dark:bg-gold-900/20 flex-shrink-0">
                  <item.icon className="h-5 w-5 text-gold-600" />
                </div>
                <div>
                  <p className="font-semibold">{t(item.titleKey)}</p>
                  <p className="text-muted-foreground">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            {t("home.shopByCollection")}
          </h2>
          <p className="text-muted-foreground">
            {t("home.shopByCollectionDesc")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-xl bg-muted aspect-square flex items-end p-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <span className="relative text-white font-semibold text-lg group-hover:text-gold-300 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                  {t("home.featuredPieces")}
                </h2>
                <p className="text-muted-foreground">
                  {t("home.mostLoved")}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products?featured=true">
                  {t("home.viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="container py-16">
        <div className="rounded-2xl bg-gradient-to-r from-stone-900 to-stone-700 p-8 md:p-12 text-white text-center">
          <Diamond className="h-10 w-10 text-gold-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-stone-300 mb-6 max-w-lg mx-auto">
            {t("home.ctaDesc")}
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link href="/products">{t("home.browseShare")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
