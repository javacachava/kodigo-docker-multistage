import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { Paginated, Product } from "@/lib/api/types";

export function getProducts(params: { search?: string; sort?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  query.set("per_page", "24");

  const qs = query.toString();
  return apiFetch<Paginated<Product>>(`/products${qs ? `?${qs}` : ""}`, {
    tags: ["products"],
    revalidate: 60,
  });
}

export function getProduct(id: string | number) {
  return apiFetch<{ data: Product }>(`/products/${id}`, {
    tags: ["products", `product-${id}`],
    revalidate: 60,
  });
}
