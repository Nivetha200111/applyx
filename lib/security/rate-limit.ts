import { createHash } from "crypto";
import { dbQuery, firstRow } from "@/lib/db";
import { HttpError } from "@/lib/security/api";

type RateLimitRow = {
  request_count: number;
  window_started_at: string;
};

type RateLimitOptions = {
  key: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
  message?: string;
};

function hashIdentifier(identifier: string) {
  return createHash("sha256").update(identifier).digest("hex");
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-vercel-forwarded-for")?.trim()
    || "unknown";
}

export function buildRateLimitIdentifier(...parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(":") || "anonymous";
}

export async function enforceRateLimit({
  key,
  identifier,
  limit,
  windowSeconds,
  message = "Too many requests. Please wait and try again.",
}: RateLimitOptions) {
  const windowMs = windowSeconds * 1000;
  const windowStartedAt = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();

  const result = await dbQuery<RateLimitRow>(
    `insert into public.request_rate_limits (
      route_key,
      identifier_hash,
      window_started_at,
      request_count
    ) values ($1, $2, $3, 1)
    on conflict (route_key, identifier_hash) do update
    set
      window_started_at = case
        when public.request_rate_limits.window_started_at = excluded.window_started_at
          then public.request_rate_limits.window_started_at
        else excluded.window_started_at
      end,
      request_count = case
        when public.request_rate_limits.window_started_at = excluded.window_started_at
          then public.request_rate_limits.request_count + 1
        else 1
      end,
      updated_at = timezone('utc', now())
    returning request_count, window_started_at`,
    [key, hashIdentifier(identifier), windowStartedAt],
  );

  const row = firstRow(result);
  const requestCount = row?.request_count ?? 0;

  if (requestCount <= limit) {
    return;
  }

  const elapsedSeconds = Math.floor((Date.now() - new Date(windowStartedAt).getTime()) / 1000);
  const retryAfter = Math.max(1, windowSeconds - elapsedSeconds);

  throw new HttpError(429, message, {
    headers: {
      "Retry-After": String(retryAfter),
    },
  });
}
