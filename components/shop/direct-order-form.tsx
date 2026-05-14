"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { guestOrderSchema, type GuestOrderInput } from "@/lib/validations/order";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";

interface DirectOrderFormProps {
  productId: string;
  productSlug: string;
  productTitle: string;
  price: number;
  maxQuantity: number;
}

export function DirectOrderForm({
  productId,
  productSlug,
  productTitle,
  price,
  maxQuantity,
}: DirectOrderFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GuestOrderInput>({
    resolver: zodResolver(guestOrderSchema),
    defaultValues: {
      productId,
      productSlug,
      quantity: 1,
      guestCountry: "LY",
    },
  });

  const quantity = watch("quantity") ?? 1;
  const total = price * quantity;

  async function onSubmit(data: GuestOrderInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? "Order failed");
      }

      setOrderSuccess({
        orderNumber: json.data.orderNumber,
        total: Number(json.data.total),
      });
      toast.success(t("buyPage.successTitle"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderSuccess) {
    return (
      <div className="bg-background rounded-2xl border border-border/50 p-8 text-center space-y-4 shadow-sm">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-green-600">{t("buyPage.successTitle")}</h2>
        <p className="text-muted-foreground">
          {t("buyPage.successDesc")}
        </p>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("buyPage.successOrderNumber")}</span>
            <span className="font-mono font-bold">{orderSuccess.orderNumber}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("buyPage.formTotal")}</span>
            <span className="font-bold">{formatPrice(orderSuccess.total)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("buyPage.successContact")}
        </p>
        <Button
          variant="gold"
          onClick={() => router.push(`/product/${productSlug}`)}
          className="w-full"
        >
          {t("buyPage.successContinue")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Quantity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("buyPage.formOrderSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">{t("buyPage.formQuantity")}</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setValue("quantity", Math.max(1, quantity - 1))
                }
                disabled={quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-12 text-center font-semibold text-lg">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setValue("quantity", Math.min(maxQuantity, quantity + 1))
                }
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {productTitle} × {quantity}
              </span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("buyPage.formShipping")}</span>
              <span className={total >= 500 ? "text-green-600" : ""}>
                {total >= 500 ? t("buyPage.formShippingFree") : formatPrice(15)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>{t("buyPage.formTotal")}</span>
              <span>{formatPrice(total >= 500 ? total : total + 15)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("buyPage.formYourInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guestName">
                {t("buyPage.formFullName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guestName"
                placeholder="John Doe"
                {...register("guestName")}
                className={errors.guestName ? "border-destructive" : ""}
              />
              {errors.guestName && (
                <p className="text-xs text-destructive">{errors.guestName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guestPhone">
                {t("buyPage.formPhone")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guestPhone"
                type="tel"
                placeholder="+218 91 234 5678"
                {...register("guestPhone")}
                className={errors.guestPhone ? "border-destructive" : ""}
              />
              {errors.guestPhone && (
                <p className="text-xs text-destructive">{errors.guestPhone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guestEmail">
              {t("buyPage.formEmail")} <span className="text-muted-foreground text-xs">({t("buyPage.formEmailOptional")})</span>
            </Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="john@example.com"
              {...register("guestEmail")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("buyPage.formDelivery")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="guestAddress">
              {t("buyPage.formStreetAddress")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestAddress"
              placeholder="123 Main Street"
              {...register("guestAddress")}
              className={errors.guestAddress ? "border-destructive" : ""}
            />
            {errors.guestAddress && (
              <p className="text-xs text-destructive">{errors.guestAddress.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guestCity">
              {t("buyPage.formCity")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestCity"
              placeholder="Tripoli"
              {...register("guestCity")}
              className={errors.guestCity ? "border-destructive" : ""}
            />
            {errors.guestCity && (
              <p className="text-xs text-destructive">{errors.guestCity.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">
              {t("buyPage.formNotes")} <span className="text-muted-foreground text-xs">({t("buyPage.formNotesOptional")})</span>
            </Label>
            <Textarea
              id="notes"
              placeholder={t("buyPage.formNotesPlaceholder")}
              rows={3}
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      <input type="hidden" {...register("productId")} />
      <input type="hidden" {...register("productSlug")} />

      <Button
        type="submit"
        size="xl"
        variant="gold"
        className="w-full"
        disabled={isSubmitting || maxQuantity === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("buyPage.formPlacingOrder")}
          </>
        ) : (
          t("buyPage.formConfirmOrder", { total: formatPrice(total >= 500 ? total : total + 15) })
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {t("buyPage.formTerms")}
      </p>
    </form>
  );
}
