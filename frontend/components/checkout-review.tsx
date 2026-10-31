"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { placeOrderAction } from "@/app/actions/checkout";
import { formatCurrency } from "@/lib/format";

export function CheckoutReview() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-black/60 dark:text-white/60">
        Tu carrito esta vacio. Vuelve al catalogo para agregar productos.
      </p>
    );
  }

  function handlePlaceOrder() {
    setError(null);
    startTransition(async () => {
      const result = await placeOrderAction(
        items.map((i) => ({ product_id: i.productId, quantity: i.quantity }))
      );

      if (!result.ok) {
        setError(result.message);
        if (result.requiresLogin) {
          router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
        }
        return;
      }

      clear();
      router.push(`/checkout/${result.orderId}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between py-3">
            <span>
              {item.quantity} x {item.name}
            </span>
            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
        <p className="text-lg font-semibold">Total: {formatCurrency(subtotal)}</p>
      </div>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={pending}
        className="self-start rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Creando orden..." : "Confirmar orden"}
      </button>
    </div>
  );
}
