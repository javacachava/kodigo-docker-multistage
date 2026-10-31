"use client";

import { useActionState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = undefined;

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[0]}</p>;
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <FieldError errors={state?.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <FieldError errors={state?.fieldErrors?.password} />
      </div>

      {state?.message ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Ingresando..." : "Iniciar sesion"}
      </button>
    </form>
  );
}

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <FieldError errors={state?.fieldErrors?.name} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <FieldError errors={state?.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          Telefono (opcional)
        </label>
        <input
          id="phone"
          name="phone"
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <FieldError errors={state?.fieldErrors?.phone} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <FieldError errors={state?.fieldErrors?.password} />
      </div>

      <div>
        <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium">
          Confirmar contrasena
        </label>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          required
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
      </div>

      {state?.message ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
