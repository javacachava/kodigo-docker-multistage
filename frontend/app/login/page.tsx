import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold">Iniciar sesion</h1>
      <LoginForm redirectTo={redirect ?? "/products"} />
      <p className="text-sm text-black/60 dark:text-white/60">
        No tienes cuenta?{" "}
        <Link href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
