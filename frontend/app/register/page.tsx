import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <RegisterForm redirectTo={redirect ?? "/products"} />
      <p className="text-sm text-black/60 dark:text-white/60">
        Ya tienes cuenta?{" "}
        <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
