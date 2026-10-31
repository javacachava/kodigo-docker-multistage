import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { getOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/errors";
import { PayButton } from "@/components/pay-button";
import { formatCurrency } from "@/lib/format";

export default async function CheckoutOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/checkout/${id}`);

  let order;
  try {
    ({ data: order } = await getOrder(id));
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  if (order.status === "paid") {
    redirect(`/checkout/${order.id}/success`);
  }

  if (!order.payment?.id) {
    throw new Error("La orden no tiene un intento de pago asociado.");
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Pagar orden {order.reference}</h1>

      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3">
            <span>
              {item.quantity} x {item.product_name}
            </span>
            <span className="font-medium">{formatCurrency(item.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
        <p className="text-lg font-semibold">Total: {formatCurrency(order.total)}</p>
      </div>

      <PayButton orderId={order.id} paymentId={order.payment.id} />
    </div>
  );
}
