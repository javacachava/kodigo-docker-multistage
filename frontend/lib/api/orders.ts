import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { Order, Paginated } from "@/lib/api/types";

export type OrderLineInput = { product_id: number; quantity: number };

export function createOrder(items: OrderLineInput[]) {
  return apiFetch<{ data: Order }>("/orders", {
    method: "POST",
    auth: true,
    body: { items },
  });
}

export function listOrders(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<Paginated<Order>>(`/orders${qs}`, {
    auth: true,
    revalidate: 0,
  });
}

export function getOrder(id: string | number) {
  return apiFetch<{ data: Order }>(`/orders/${id}`, {
    auth: true,
    revalidate: 0,
  });
}
