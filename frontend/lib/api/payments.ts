import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { Order, Payment } from "@/lib/api/types";

export function createPaymentIntent(orderId: string | number) {
  return apiFetch<{ data: Payment }>(`/orders/${orderId}/payments`, {
    method: "POST",
    auth: true,
  });
}

export function confirmPayment(paymentId: string | number, paymentMethod: string) {
  return apiFetch<{ data: Payment; order: Order }>(`/payments/${paymentId}/confirm`, {
    method: "POST",
    auth: true,
    body: { payment_method: paymentMethod },
  });
}
