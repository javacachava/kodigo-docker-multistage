import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { getOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/errors";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/account/orders/${id}`);

  let order;
  try {
    ({ data: order } = await getOrder(id));
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orden {order.reference}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="text-sm text-black/60 dark:text-white/60">
        Creada el {formatDate(order.created_at)}
      </p>

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

      <div className="flex flex-col gap-1 border-t border-black/10 pt-4 dark:border-white/10">
        <div className="flex justify-between text-sm text-black/60 dark:text-white/60">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-black/60 dark:text-white/60">
          <span>Impuestos</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {order.status === "pending" ? (
        <Link
          href={`/checkout/${order.id}`}
          className="self-start rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          Completar pago
        </Link>
      ) : null}

      {order.payment?.id ? (
        <div className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
          <p className="font-medium">Pago</p>
          <p className="text-black/60 dark:text-white/60">
            Estado: {order.payment.status} · {formatCurrency(order.payment.amount)}
          </p>
          {order.payment.paid_at ? (
            <p className="text-black/60 dark:text-white/60">
              Pagado el {formatDate(order.payment.paid_at)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
