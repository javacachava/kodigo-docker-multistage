"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm({
  defaultSearch,
  defaultSort,
}: {
  defaultSearch?: string;
  defaultSort?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch ?? "");
  const [sort, setSort] = useState(defaultSort ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <input
        type="search"
        aria-label="Buscar productos"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o SKU"
        className="flex-1 min-w-[200px] rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
      />
      <select
        aria-label="Ordenar productos"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
      >
        <option value="">Orden por defecto</option>
        <option value="price">Precio: menor a mayor</option>
        <option value="-price">Precio: mayor a menor</option>
        <option value="name">Nombre A-Z</option>
        <option value="-created_at">Mas recientes</option>
      </select>
      <button
        type="submit"
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        Filtrar
      </button>
    </form>
  );
}
