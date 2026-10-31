import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-black/10 transition hover:shadow-md dark:border-white/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-black/5 dark:bg-white/5">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-black/40 dark:text-white/40">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="font-medium">{product.name}</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
        </p>
        <p className="mt-auto text-lg font-semibold">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  );
}
