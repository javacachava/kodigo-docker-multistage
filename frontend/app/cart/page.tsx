"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, removeItem, setQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-semibold">Tu carrito esta vacio</h1>
        <Link href="/products" className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
          Ver catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Carrito</h1>

      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
              ) : null}
            </div>

            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-black/60 dark:text-white/60">
                {formatCurrency(item.price)} c/u
              </p>
            </div>

            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              className="w-16 rounded-md border border-black/15 bg-transparent px-2 py-1 text-center text-sm dark:border-white/15"
            />

            <p className="w-24 text-right font-medium">
              {formatCurrency(item.price * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-red-600 hover:underline dark:text-red-400"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
        <p className="text-lg font-semibold">Subtotal: {formatCurrency(subtotal)}</p>
        <Link
          href="/checkout"
          className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
