# ApplyX OpenClaw Notifier

This service is the bridge between ApplyX and OpenClaw.

It receives a signed webhook from ApplyX whenever a tracked application enters the
`applied` state, then sends a WhatsApp message through the local OpenClaw CLI.

## What Runs On The VM

- OpenClaw, paired to your WhatsApp number
- this notifier service
- a reverse proxy like Caddy or Nginx

OpenClaw should stay private on the VM. Expose only this notifier over HTTPS.

## Environment

Copy `.env.example` and set:

- `PORT`
- `APPLYX_NOTIFY_SECRET`
- `OPENCLAW_TARGET`
- `OPENCLAW_BIN`

The secret must match `OPENCLAW_NOTIFY_SECRET` in ApplyX.

## Start The Notifier

```bash
node services/openclaw-notifier/server.mjs
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

## Suggested Reverse Proxy

Point a subdomain like `notify.applyx.space` to the VM and proxy:

- `https://notify.applyx.space/notify/application-applied`
  -> `http://127.0.0.1:8787/notify/application-applied`
- `https://notify.applyx.space/health`
  -> `http://127.0.0.1:8787/health`

Sample Caddy config is included in `Caddyfile`.

## ApplyX Side

Set these in Vercel:

- `OPENCLAW_NOTIFY_URL=https://notify.applyx.space/notify/application-applied`
- `OPENCLAW_NOTIFY_SECRET=<same secret as the VM>`
- `OPENCLAW_NOTIFY_TIMEOUT_MS=2500`

## Recommended Trigger Points

ApplyX now sends the webhook when:

- an application is created directly as `applied`
- a tracked application is updated into `applied`
- auto-tailor moves a tracked role into `applied`

## Important Limits

- this does not auto-apply to third-party sites
- it notifies when ApplyX marks a role as `applied`
- OpenClaw must already be installed and paired on the VM
