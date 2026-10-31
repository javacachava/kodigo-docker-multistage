import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { listOrders } from "@/lib/api/orders";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

async function OrderList() {
  const { data: orders } = await listOrders();

  if (orders.length === 0) {
    return (
      <p className="text-black/60 dark:text-white/60">
        Todavia no tienes compras. <Link href="/products" className="underline">Explora el catalogo</Link>.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
      {orders.map((order) => (
        <li key={order.id} className="flex items-center justify-between py-4">
          <div>
            <Link href={`/account/orders/${order.id}`} className="font-medium underline">
              {order.reference}
            </Link>
            <p className="text-sm text-black/60 dark:text-white/60">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formatCurrency(order.total)}</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
      ))}
    </div>
  );
}

export default async function OrdersPage() {
  await requireUser("/account/orders");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Mis compras</h1>
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList />
      </Suspense>
    </div>
  );
}
