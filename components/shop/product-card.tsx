"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import { formatPrice, getDiscountPercent, getDirectOrderUrl } from "@/lib/utils";
import { toast } from "sonner";
import type { ProductWithImages } from "@/lib/services/product.service";

interface ProductCardProps {
  product: ProductWithImages;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const price = Number(product.discountedPrice ?? product.price);
  const originalPrice = Number(product.price);
  const hasDiscount = product.discountedPrice && Number(product.discountedPrice) < originalPrice;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (product.stockQuantity === 0) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price,
      imageUrl: primaryImage?.url ?? "",
      quantity: 1,
      stockQuantity: product.stockQuantity,
    });
    toast.success("Added to cart");
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    const url = getDirectOrderUrl(product.slug);
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Direct order link copied!");
    });
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs">
                -{getDiscountPercent(originalPrice, Number(product.discountedPrice))}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge variant="gold" className="text-xs">
                Featured
              </Badge>
            )}
            {product.stockQuantity === 0 && (
              <Badge variant="secondary" className="text-xs">
                Out of stock
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={handleShare}
              title="Copy direct order link"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {product.category.name}
          </p>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-gold-600 transition-colors">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="gold"
              className="flex-1 text-xs"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              asChild
            >
              <Link href={`/buy/${product.slug}`}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
