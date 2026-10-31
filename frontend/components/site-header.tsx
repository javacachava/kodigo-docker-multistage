"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { logoutAction } from "@/app/actions/auth";
import type { User } from "@/lib/api/types";

export function SiteHeader({ user }: { user: User | null }) {
  const { count } = useCart();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/products" className="text-lg font-semibold tracking-tight">
          Kodigo Store
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline">
            Catalogo
          </Link>

          {user ? (
            <Link href="/account/orders" className="hover:underline">
              Mis compras
            </Link>
          ) : null}

          <Link href="/cart" className="relative hover:underline">
            Carrito
            {count > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-xs text-background">
                {count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <form action={logoutAction}>
              <button type="submit" className="hover:underline">
                Salir ({user.name.split(" ")[0]})
              </button>
            </form>
          ) : (
            <Link href="/login" className="hover:underline">
              Iniciar sesion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
