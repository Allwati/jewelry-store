"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } =
    useCartStore();
  const { t } = useLanguage();

  const subtotal = totalPrice();
  const shipping = subtotal >= 500 ? 0 : 15;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <div className="container py-24 text-center">
        <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
        <h1 className="font-serif text-3xl font-bold mb-3">{t("cart.empty")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("cart.emptyDesc")}
        </p>
        <Button variant="gold" size="lg" asChild>
          <Link href="/products">
            {t("cart.browseCollection")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">{t("cart.title")}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card"
            >
              {/* Image */}
              <Link
                href={`/product/${item.slug}`}
                className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-semibold hover:text-gold-600 transition-colors line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatPrice(item.price)} {t("cart.each")}
                </p>

                {/* Qty controls */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stockQuantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Subtotal + remove */}
              <div className="flex flex-col items-end justify-between">
                <span className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={clearCart}
            >
              <Trash2 className="h-4 w-4 me-1" />
              {t("cart.clearCart")}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border/50 bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">{t("cart.orderSummary")}</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.shipping")}</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>
                  {shipping === 0 ? t("cart.free") : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("cart.addMoreForFreeShipping", { amount: formatPrice(500 - subtotal) })}
                </p>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button variant="gold" size="lg" className="w-full" asChild>
              <Link href="/checkout">
                {t("cart.proceedToCheckout")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t("cart.secureCheckout")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
