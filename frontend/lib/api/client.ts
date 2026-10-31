import "server-only";
import { getApiBaseUrl } from "@/lib/env";
import { getSessionToken } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  tags?: string[];
  revalidate?: number | false;
  cache?: RequestCache;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, tags, revalidate, cache } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = await getSessionToken();
    if (!token) {
      throw new ApiError(401, "No autenticado.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const next: { tags?: string[]; revalidate?: number | false } = {};
  if (tags) next.tags = tags;
  if (revalidate !== undefined) next.revalidate = revalidate;

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next: Object.keys(next).length ? next : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : undefined) ?? `Error ${response.status} al comunicarse con la API.`;
    const errors =
      payload && typeof payload === "object" && "errors" in payload
        ? (payload as { errors: Record<string, string[]> }).errors
        : undefined;
    throw new ApiError(response.status, message, errors);
  }

  return payload as T;
}
