import "server-only";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "kodigo_token";

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

export async function setSessionToken(token: string, expiresInSeconds: number) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds,
  });
}

export async function clearSessionToken() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}
