"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payOrderAction } from "@/app/actions/checkout";

export function PayButton({ orderId, paymentId }: { orderId: number; paymentId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pay(method: "pm_card_visa" | "pm_card_chargeDeclined") {
    setError(null);
    startTransition(async () => {
      const result = await payOrderAction(orderId, paymentId, method);

      if (!result.ok) {
        setError(result.message);
        if (result.requiresLogin) {
          router.push(`/login?redirect=${encodeURIComponent(`/checkout/${orderId}`)}`);
        }
        return;
      }

      router.push(`/checkout/${orderId}/success`);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => pay("pm_card_visa")}
          className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {pending ? "Procesando..." : "Pagar con Stripe"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => pay("pm_card_chargeDeclined")}
          className="rounded-md border border-black/15 px-5 py-2.5 text-sm font-medium disabled:opacity-50 dark:border-white/15"
        >
          Simular rechazo
        </button>
      </div>

      <p className="text-xs text-black/50 dark:text-white/50">
        Modo de simulacion de Stripe: usa &quot;Pagar con Stripe&quot; para un pago exitoso o
        &quot;Simular rechazo&quot; para probar un fallo y reintentar.
      </p>
    </div>
  );
}
