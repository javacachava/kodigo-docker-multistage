"use server";

import { redirect } from "next/navigation";
import { registerUser, loginUser, logoutUser } from "@/lib/api/auth";
import { setSessionToken, clearSessionToken, getSessionToken } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";

export type AuthFormState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

function safeRedirectTarget(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/") ? value : "/products";
}

export async function loginAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectTarget(formData.get("redirect"));

  try {
    const auth = await loginUser({ email, password });
    await setSessionToken(auth.access_token, auth.expires_in);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.errors };
    }
    return { message: "No se pudo iniciar sesion. Intenta nuevamente." };
  }

  redirect(redirectTo);
}

export async function registerAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("password_confirmation") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const redirectTo = safeRedirectTarget(formData.get("redirect"));

  try {
    const auth = await registerUser({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      phone: phone || undefined,
    });
    await setSessionToken(auth.access_token, auth.expires_in);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, fieldErrors: error.errors };
    }
    return { message: "No se pudo crear la cuenta. Intenta nuevamente." };
  }

  redirect(redirectTo);
}

export async function logoutAction() {
  const token = await getSessionToken();
  if (token) {
    try {
      await logoutUser();
    } catch {
      // token already invalid/expired server-side; proceed to clear locally
    }
  }
  await clearSessionToken();
  redirect("/login");
}
