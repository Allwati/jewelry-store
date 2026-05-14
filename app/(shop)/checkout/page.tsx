"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart.store";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const { t } = useLanguage();

  const subtotal = totalPrice();
  const shipping = subtotal >= 500 ? 0 : 15;
  const total = subtotal + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      guestCountry: "LY",
    },
  });

  if (!items.length && !orderNumber) {
    return (
      <div className="container py-24 text-center">
        <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold mb-3">{t("checkout.cartEmpty")}</h1>
        <Button variant="gold" asChild>
          <Link href="/products">{t("checkout.browseCollection")}</Link>
        </Button>
      </div>
    );
  }

  if (orderNumber) {
    return (
      <div className="container max-w-lg py-24 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="font-serif text-3xl font-bold mb-3 text-green-600">
          {t("checkout.orderPlaced")}
        </h1>
        <p className="text-muted-foreground mb-4">
          {t("checkout.orderConfirmed", { orderNumber: `<span class="font-mono font-bold">${orderNumber}</span>` })}
        </p>
        <p className="text-sm text-muted-foreground mb-8">{t("checkout.willContact")}</p>
        <Button variant="gold" size="lg" asChild>
          <Link href="/products">{t("checkout.continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(data: CheckoutInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Checkout failed");

      setOrderNumber(json.data.orderNumber);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="font-serif text-3xl font-bold mb-8">{t("checkout.title")}</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("checkout.contactInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="guestName">{t("checkout.fullName")}</Label>
                    <Input id="guestName" {...register("guestName")} placeholder="John Doe" className={errors.guestName ? "border-destructive" : ""} />
                    {errors.guestName && <p className="text-xs text-destructive">{errors.guestName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guestPhone">{t("checkout.phone")}</Label>
                    <Input id="guestPhone" type="tel" {...register("guestPhone")} placeholder="+218 91 234 5678" className={errors.guestPhone ? "border-destructive" : ""} />
                    {errors.guestPhone && <p className="text-xs text-destructive">{errors.guestPhone.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guestEmail">{t("checkout.email")}</Label>
                  <Input id="guestEmail" type="email" {...register("guestEmail")} placeholder="john@example.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("checkout.shippingAddress")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="guestAddress">{t("checkout.streetAddress")}</Label>
                  <Input id="guestAddress" {...register("guestAddress")} placeholder="123 Main St" className={errors.guestAddress ? "border-destructive" : ""} />
                  {errors.guestAddress && <p className="text-xs text-destructive">{errors.guestAddress.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guestCity">{t("checkout.city")}</Label>
                  <Input id="guestCity" {...register("guestCity")} placeholder="Tripoli" className={errors.guestCity ? "border-destructive" : ""} />
                  {errors.guestCity && <p className="text-xs text-destructive">{errors.guestCity.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">{t("checkout.orderNotes")}</Label>
                  <Textarea id="notes" {...register("notes")} placeholder={t("checkout.orderNotesPlaceholder")} rows={3} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">{t("checkout.orderSummary")}</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 text-sm">
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 font-medium">{item.title}</p>
                      <p className="text-muted-foreground">×{item.quantity}</p>
                    </div>
                    <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? t("checkout.free") : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>{t("checkout.total")}</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("checkout.processing")}
                  </>
                ) : (
                  t("checkout.placeOrder")
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
