import { createHmac } from "node:crypto";

type AppliedNotificationInput = {
  applicationId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  companyName: string;
  roleTitle: string;
  sourceUrl: string | null;
  appliedAt: string;
};

type AppliedNotificationPayload = AppliedNotificationInput & {
  event: "application.applied";
  eventId: string;
  trackerUrl: string | null;
};

function getOpenClawConfig() {
  const url = process.env.OPENCLAW_NOTIFY_URL?.trim() ?? "";
  const secret = process.env.OPENCLAW_NOTIFY_SECRET?.trim() ?? "";

  if (!url || !secret) {
    return null;
  }

  return { url, secret };
}

function getTrackerUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";

  if (!appUrl) {
    return null;
  }

  return `${appUrl.replace(/\/+$/, "")}/tracker`;
}

function signPayload(secret: string, timestamp: string, body: string) {
  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  return `sha256=${digest}`;
}

export async function notifyApplicationApplied(input: AppliedNotificationInput) {
  const config = getOpenClawConfig();

  if (!config) {
    return { ok: false, skipped: true as const, reason: "not_configured" };
  }

  const payload: AppliedNotificationPayload = {
    ...input,
    event: "application.applied",
    eventId: `application.applied:${input.applicationId}:${input.appliedAt}`,
    trackerUrl: getTrackerUrl(),
  };

  const rawBody = JSON.stringify(payload);
  const timestamp = new Date().toISOString();
  const signature = signPayload(config.secret, timestamp, rawBody);
  const timeoutMs = Math.min(
    10_000,
    Math.max(1_000, Number.parseInt(process.env.OPENCLAW_NOTIFY_TIMEOUT_MS ?? "2500", 10) || 2500),
  );

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-applyx-event": payload.event,
        "x-applyx-timestamp": timestamp,
        "x-applyx-signature": signature,
      },
      body: rawBody,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      console.error(
        `[openclaw] Notification failed with status ${response.status} for application ${input.applicationId}.`,
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
      `[openclaw] Notification failed for application ${input.applicationId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );

    return { ok: false, skipped: false as const, reason: "network_error" };
  }
}
