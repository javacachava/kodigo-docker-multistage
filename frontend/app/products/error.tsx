"use client";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
      <h2 className="font-semibold">No se pudo cargar el catalogo</h2>
      <p className="text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-red-900 px-4 py-2 text-sm font-medium text-white dark:bg-red-100 dark:text-red-950"
      >
        Reintentar
      </button>
    </div>
  );
}
