"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import type { Product } from "@/lib/api/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => {
        addItem(
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            imageUrl: product.image_url,
          },
          1
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
    >
      {outOfStock ? "Agotado" : added ? "Agregado" : "Agregar al carrito"}
    </button>
  );
}
