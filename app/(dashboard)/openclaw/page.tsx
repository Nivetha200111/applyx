import Link from "next/link";
import { ArrowRight, BellRing, MessageSquareText, Shield } from "lucide-react";
import { AnimatedPanel } from "@/components/ui/animated-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function OpenClawPage() {
  await requireUser("/openclaw");

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="warning" className="w-fit">
          Coming soon
        </Badge>
        <h1 className="text-3xl font-semibold">WhatsApp Alerts</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          The OpenClaw-powered alert experience is not ready for users yet. The backend
          notification plumbing is being kept in place, but the setup, pairing, and UI flow
          still need to be productized.
        </p>
      </div>

      <AnimatedPanel>
        <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <BellRing className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Backend is wired. Product surface is not.</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 text-muted-foreground">
                ApplyX can already emit signed application events to a private bridge, but the
                OpenClaw onboarding flow, VM setup, and end-user controls are still being
                stabilized before this becomes a real feature.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Notifications</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                WhatsApp delivery is planned for real application events, not generic activity
                spam.
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Security first</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The final version needs signed webhooks, a hardened bridge, and a setup flow
                that does not expose your WhatsApp session.
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BellRing className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Not user-ready</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Until the provisioning and pairing flow are smoother, this stays intentionally
                out of the product surface.
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedPanel>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Use the tracker for now</CardTitle>
            <CardDescription>
              Keep application status, notes, and follow-ups organized without the alert
              layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants(), "gap-2")} href="/tracker">
              Open tracker
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check account settings</CardTitle>
            <CardDescription>
              Billing, plan details, and the rest of your account controls still live here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants({ variant: "outline" }), "gap-2")} href="/settings">
              Open settings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
