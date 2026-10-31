import { Suspense } from "react";
import { getProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/product-card";
import { SearchForm } from "@/components/search-form";

async function ProductGrid({ search, sort }: { search?: string; sort?: string }) {
  const { data: products } = await getProducts({ search, sort });

  if (products.length === 0) {
    return <p className="text-black/60 dark:text-white/60">No se encontraron productos.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
      ))}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const { search, sort } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Catalogo</h1>
        <SearchForm defaultSearch={search} defaultSort={sort} />
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid search={search} sort={sort} />
      </Suspense>
    </div>
  );
}
