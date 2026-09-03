import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/services/product.service";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/server-i18n";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? `Edit: ${product.title}` : "Product Not Found" };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories, t] = await Promise.all([
    getProductById(id),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getT(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="h-4 w-4" />
              {t("adminProducts.back")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("adminProducts.editProduct")}</h1>
            <p className="text-muted-foreground">{product.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/product/${product.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              {t("adminProducts.view")}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/buy/${product.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              {t("adminProducts.buyLink")}
            </Link>
          </Button>
        </div>
      </div>

      <ProductForm
        categories={categories}
        initialData={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription ?? "",
          sku: product.sku,
          price: Number(product.price),
          discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : undefined,
          stockQuantity: product.stockQuantity,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
          isAvailable: product.isAvailable,
          material: product.material ?? "",
          tags: product.tags,
          images: product.images.map((img) => ({
            url: img.url,
            publicId: img.publicId ?? undefined,
            altText: img.altText ?? undefined,
            isPrimary: img.isPrimary,
          })),
        }}
      />
    </div>
  );
}
