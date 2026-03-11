const APPLYX_CONVERSION_URL = "https://grow.applyx.space/api/internal/conversion";

type SignupConversionInput = {
  source?: string | null;
  slug?: string | null;
  userId: string;
};

function getInternalApiKey() {
  const apiKey = process.env.APPLYX_INTERNAL_API_KEY?.trim() ?? "";
  return apiKey || null;
}

export async function sendSignupConversion(input: SignupConversionInput) {
  const apiKey = getInternalApiKey();

  if (!apiKey) {
    return { ok: false, skipped: true as const, reason: "not_configured" };
  }

  try {
    const response = await fetch(APPLYX_CONVERSION_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-applyx-internal-key": apiKey,
        "x-applyx-internal-api-key": apiKey,
      },
      body: JSON.stringify({
        eventType: "signup",
        source: input.source ?? "unknown",
        slug: input.slug ?? null,
        userId: input.userId,
        metadata: null,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });

    if (!response.ok) {
      console.error(
        `[internal-conversion] Signup callback failed with status ${response.status} for user ${input.userId}.`,
      );

      return {
        ok: false,
        skipped: false as const,
        reason: `http_${response.status}`,
      };
    }

    return { ok: true, skipped: false as const };
  } catch (error) {
    console.error(
      `[internal-conversion] Signup callback failed for user ${input.userId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );

    return { ok: false, skipped: false as const, reason: "network_error" };
  }
}
