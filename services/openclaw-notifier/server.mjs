import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const PORT = Number.parseInt(process.env.PORT ?? "8787", 10) || 8787;
const APPLYX_NOTIFY_SECRET = process.env.APPLYX_NOTIFY_SECRET?.trim() ?? "";
const OPENCLAW_TARGET = process.env.OPENCLAW_TARGET?.trim() ?? "";
const OPENCLAW_BIN = process.env.OPENCLAW_BIN?.trim() || "openclaw";
const EVENT_WINDOW_MS = 5 * 60 * 1000;
const MESSAGE_TIMEOUT_MS = 15_000;
const recentEventIds = new Map();

const payloadSchema = z.object({
  event: z.literal("application.applied"),
  eventId: z.string().min(10),
  applicationId: z.string().min(10),
  userId: z.string().min(10),
  userEmail: z.string().email(),
  userName: z.string().nullable(),
  companyName: z.string().min(1),
  roleTitle: z.string().min(1),
  sourceUrl: z.string().url().nullable(),
  appliedAt: z.string().min(10),
  trackerUrl: z.string().url().nullable(),
});

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function signBody(secret, timestamp, body) {
  return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function formatAppliedMessage(payload) {
  const lines = [
    "ApplyX alert",
    `Applied: ${payload.roleTitle} at ${payload.companyName}`,
    `User: ${payload.userName || payload.userEmail}`,
    `Email: ${payload.userEmail}`,
    `Applied at: ${payload.appliedAt}`,
  ];

  if (payload.sourceUrl) {
    lines.push(`Source: ${payload.sourceUrl}`);
  }

  if (payload.trackerUrl) {
    lines.push(`Tracker: ${payload.trackerUrl}`);
  }

  return lines.join("\n");
}

async function sendWhatsAppMessage(message) {
  const args = [
    "message",
    "send",
    "--channel",
    "whatsapp",
    "--target",
    OPENCLAW_TARGET,
    "--message",
    message,
  ];

  await execFileAsync(OPENCLAW_BIN, args, {
    timeout: MESSAGE_TIMEOUT_MS,
    maxBuffer: 1024 * 1024,
  });
}

function cleanupEventCache() {
  const cutoff = Date.now() - EVENT_WINDOW_MS;

  for (const [eventId, createdAt] of recentEventIds.entries()) {
    if (createdAt < cutoff) {
      recentEventIds.delete(eventId);
    }
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, {
      ok: true,
      service: "applyx-openclaw-notifier",
      targetConfigured: Boolean(OPENCLAW_TARGET),
      secretConfigured: Boolean(APPLYX_NOTIFY_SECRET),
    });
  }

  if (req.method !== "POST" || req.url !== "/notify/application-applied") {
    return json(res, 404, { error: "Not found." });
  }

  if (!APPLYX_NOTIFY_SECRET || !OPENCLAW_TARGET) {
    return json(res, 500, { error: "Notifier is not configured." });
  }

  const rawChunks = [];

  req.on("data", (chunk) => {
    rawChunks.push(chunk);
  });

  req.on("error", () => {
    json(res, 400, { error: "Invalid request stream." });
  });

  req.on("end", async () => {
    try {
      cleanupEventCache();

      const rawBody = Buffer.concat(rawChunks).toString("utf8");
      const timestamp = req.headers["x-applyx-timestamp"];
      const signature = req.headers["x-applyx-signature"];

      if (typeof timestamp !== "string" || typeof signature !== "string") {
        return json(res, 401, { error: "Missing signature headers." });
      }

      const timestampMs = Date.parse(timestamp);
      if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > EVENT_WINDOW_MS) {
        return json(res, 401, { error: "Stale request." });
      }

      const expectedSignature = signBody(APPLYX_NOTIFY_SECRET, timestamp, rawBody);
      if (!safeCompare(signature, expectedSignature)) {
        return json(res, 401, { error: "Invalid signature." });
      }

      const payload = payloadSchema.parse(JSON.parse(rawBody));

      if (recentEventIds.has(payload.eventId)) {
        return json(res, 200, { ok: true, duplicate: true });
      }

      await sendWhatsAppMessage(formatAppliedMessage(payload));
      recentEventIds.set(payload.eventId, Date.now());

      return json(res, 200, { ok: true });
    } catch (error) {
      console.error(
        `[openclaw-notifier] ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );

      return json(res, 500, { error: "Unable to deliver notification." });
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ApplyX OpenClaw notifier listening on :${PORT}`);
});
