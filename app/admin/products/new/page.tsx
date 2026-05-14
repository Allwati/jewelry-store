import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const [categories, t] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getT(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
            {t("adminProducts.back")}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("adminProducts.addProduct")}</h1>
          <p className="text-muted-foreground">{t("adminProducts.newListing")}</p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
