"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";
import type { Category } from "@prisma/client";

interface ProductImage {
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary: boolean;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: Partial<ProductInput> & {
    id?: string;
    images?: ProductImage[];
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const isEditing = !!initialData?.id;
  const [images, setImages] = useState<ProductImage[]>(
    initialData?.images ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      sku: initialData?.sku ?? "",
      price: initialData?.price ?? 0,
      discountedPrice: initialData?.discountedPrice ?? undefined,
      stockQuantity: initialData?.stockQuantity ?? 0,
      categoryId: initialData?.categoryId ?? "",
      isFeatured: initialData?.isFeatured ?? false,
      isAvailable: initialData?.isAvailable ?? true,
      material: initialData?.material ?? "",
      tags: initialData?.tags ?? [],
    },
  });

  const title = watch("title");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue("title", val);
    if (!isEditing) {
      setValue("slug", slugify(val));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Upload failed");

      const newImages: ProductImage[] = json.data.map(
        (img: { url: string; publicId: string }, index: number) => ({
          url: img.url,
          publicId: img.publicId,
          isPrimary: images.length === 0 && index === 0,
        })
      );

      setImages((prev) => [...prev, ...newImages]);
      toast.success(t("adminProducts.formImagesUploaded", { count: String(newImages.length) }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminProducts.formUploadFailed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length && !updated.some((i) => i.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  }

  function setPrimary(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  }

  async function onSubmit(data: ProductInput) {
    if (!images.length) {
      toast.error(t("adminProducts.formRequiredImage"));
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEditing
        ? `/api/admin/products/${initialData!.id}`
        : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");

      toast.success(isEditing ? t("adminProducts.formProductUpdated") : t("adminProducts.formProductCreated"));
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminProducts.formSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("adminProducts.formProductInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">{t("adminProducts.formTitle")} *</Label>
                <Input
                  id="title"
                  placeholder="Diamond Solitaire Ring"
                  {...register("title", { onChange: handleTitleChange })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">{t("adminProducts.formSlug")} *</Label>
                <Input
                  id="slug"
                  placeholder="diamond-solitaire-ring"
                  {...register("slug")}
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("adminProducts.formSlugHint", { slug: watch("slug") || "..." })}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shortDescription">{t("adminProducts.formShortDesc")}</Label>
                <Input
                  id="shortDescription"
                  placeholder={t("adminProducts.formShortDescPlaceholder")}
                  {...register("shortDescription")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">{t("adminProducts.formDescription")} *</Label>
                <Textarea
                  id="description"
                  placeholder={t("adminProducts.formDescriptionPlaceholder")}
                  rows={6}
                  {...register("description")}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("adminProducts.formImages")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${img.isPrimary ? "border-gold-500 ring-2 ring-gold-500/30" : "border-border hover:border-gold-300"}`}
                    onClick={() => setPrimary(index)}
                  >
                    <Image
                      src={img.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    {img.isPrimary && (
                      <div className="absolute bottom-1 start-1 end-1 bg-gold-500 text-white text-[10px] text-center rounded px-1 py-0.5">
                        {t("adminProducts.formImagePrimary")}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-1 end-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <label
                  className={`aspect-square rounded-lg border-2 border-dashed border-border hover:border-gold-400 cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-gold-500 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-6 w-6 mb-1" />
                      <span className="text-xs">{t("adminProducts.formAddImage")}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("adminProducts.formImagesHint")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("adminProducts.formPricing")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">{t("adminProducts.formPrice")} *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price", { valueAsNumber: true })}
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discountedPrice">{t("adminProducts.formDiscountedPrice")}</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("adminProducts.formDiscountedPricePlaceholder")}
                  {...register("discountedPrice", {
                    setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                  })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku">{t("adminProducts.formSku")} *</Label>
                <Input
                  id="sku"
                  placeholder="RING-001"
                  {...register("sku")}
                  className={errors.sku ? "border-destructive" : ""}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive">{errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stockQuantity">{t("adminProducts.formStock")} *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stockQuantity", { valueAsNumber: true })}
                  className={errors.stockQuantity ? "border-destructive" : ""}
                />
                {errors.stockQuantity && (
                  <p className="text-xs text-destructive">{errors.stockQuantity.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("adminProducts.formOrganization")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("adminProducts.formCategory")} *</Label>
                <Select
                  defaultValue={initialData?.categoryId}
                  onValueChange={(val) => setValue("categoryId", val)}
                >
                  <SelectTrigger
                    className={errors.categoryId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder={t("adminProducts.formCategoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="material">{t("adminProducts.formMaterial")}</Label>
                <Input
                  id="material"
                  placeholder={t("adminProducts.formMaterialPlaceholder")}
                  {...register("material")}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isFeatured")}
                    className="rounded"
                  />
                  <span className="text-sm">{t("adminProducts.formFeatured")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isAvailable")}
                    defaultChecked
                    className="rounded"
                  />
                  <span className="text-sm">{t("adminProducts.formAvailable")}</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              {t("adminProducts.formCancel")}
            </Button>
            <Button
              type="submit"
              variant="gold"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                t("adminProducts.formUpdate")
              ) : (
                t("adminProducts.formCreate")
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
