import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/products";
import { ApiError } from "@/lib/api/errors";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatCurrency } from "@/lib/format";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    ({ data: product } = await getProduct(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-black/40 dark:text-white/40">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-black/60 dark:text-white/60">SKU: {product.sku}</p>
        </div>

        <p className="text-3xl font-bold">{formatCurrency(product.price)}</p>

        <p className="text-sm text-black/60 dark:text-white/60">
          {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock disponible"}
        </p>

        {product.description ? (
          <p className="leading-relaxed">{product.description}</p>
        ) : null}

        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
