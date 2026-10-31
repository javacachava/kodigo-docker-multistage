import type { OrderStatus } from "@/lib/api/types";

const labels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  failed: "Fallida",
  cancelled: "Cancelada",
};

const styles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
  paid: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
  failed: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
  cancelled: "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
