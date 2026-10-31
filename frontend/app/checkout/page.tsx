import { requireUser } from "@/lib/auth/dal";
import { CheckoutReview } from "@/components/checkout-review";

export default async function CheckoutPage() {
  await requireUser("/checkout");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Revisar orden</h1>
      <CheckoutReview />
    </div>
  );
}
