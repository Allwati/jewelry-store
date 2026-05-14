"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";
import type { ProductWithImages } from "@/lib/services/product.service";

interface AddToCartButtonProps {
  product: ProductWithImages;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const price = Number(product.discountedPrice ?? product.price);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const isOutOfStock = product.stockQuantity === 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price,
      imageUrl: primaryImage?.url ?? "",
      quantity: qty,
      stockQuantity: product.stockQuantity,
    });
    toast.success(`${product.title} added to cart`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1">
      {/* Quantity selector */}
      <div className="flex items-center border border-input rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none border-r"
          onClick={() => setQty(Math.max(1, qty - 1))}
          disabled={qty <= 1}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-12 text-center text-sm font-medium">{qty}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none border-l"
          onClick={() =>
            setQty(Math.min(product.stockQuantity, qty + 1))
          }
          disabled={qty >= product.stockQuantity}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Button
        size="lg"
        variant="gold"
        className="flex-1"
        onClick={handleAdd}
        disabled={isOutOfStock}
      >
        <ShoppingCart className="h-4 w-4" />
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
