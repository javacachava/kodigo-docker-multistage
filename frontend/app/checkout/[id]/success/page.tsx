import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { getOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/checkout/${id}/success`);

  let order;
  try {
    ({ data: order } = await getOrder(id));
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  if (order.status !== "paid") {
    redirect(`/checkout/${order.id}`);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-lg border border-green-300 bg-green-50 p-8 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
      <h1 className="text-2xl font-semibold">Compra confirmada</h1>
      <p>
        Orden <strong>{order.reference}</strong> pagada por {formatCurrency(order.total)}.
      </p>
      {order.payment?.paid_at ? <p className="text-sm">Fecha de pago: {formatDate(order.payment.paid_at)}</p> : null}

      <div className="flex gap-4 pt-4">
        <Link href="/account/orders" className="underline">
          Ver mi historial de compras
        </Link>
        <Link href="/products" className="underline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
