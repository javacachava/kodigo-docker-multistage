import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { AuthResponse, User } from "@/lib/api/types";

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function loginUser(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function getMe() {
  return apiFetch<{ data: User }>("/auth/me", { auth: true });
}

export function logoutUser() {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
    auth: true,
  });
}
