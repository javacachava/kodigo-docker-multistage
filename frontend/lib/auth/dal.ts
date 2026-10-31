import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionToken, clearSessionToken } from "@/lib/auth/session";
import { getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const { data } = await getMe();
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearSessionToken();
      return null;
    }
    throw error;
  }
});

export async function requireUser(currentPath: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }
  return user;
}
