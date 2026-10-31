"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/dal";
import { createOrder, type OrderLineInput } from "@/lib/api/orders";
import { createPaymentIntent, confirmPayment } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/errors";

export type PlaceOrderResult =
  | { ok: true; orderId: number }
  | { ok: false; message: string; requiresLogin?: boolean };

export async function placeOrderAction(items: OrderLineInput[]): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Debes iniciar sesion para continuar.", requiresLogin: true };
  }

  if (items.length === 0) {
    return { ok: false, message: "El carrito esta vacio." };
  }

  try {
    const { data: order } = await createOrder(items);
    await createPaymentIntent(order.id);
    revalidatePath("/account/orders");
    return { ok: true, orderId: order.id };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "No se pudo crear la orden." };
  }
}

export type PayResult = { ok: true } | { ok: false; message: string; requiresLogin?: boolean };

export async function payOrderAction(
  orderId: number,
  paymentId: number,
  paymentMethod: "pm_card_visa" | "pm_card_chargeDeclined"
): Promise<PayResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Debes iniciar sesion para continuar.", requiresLogin: true };
  }

  try {
    await confirmPayment(paymentId, paymentMethod);
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: "No se pudo procesar el pago." };
  }

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/checkout/${orderId}`);
  return { ok: true };
}
