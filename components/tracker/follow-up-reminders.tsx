"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  companyName: string;
  roleTitle: string;
  status: string;
  appliedAt: string | null;
  followUpAt: string;
  followedUp: boolean;
}

function daysOverdue(followUpAt: string): number {
  const diff = Date.now() - new Date(followUpAt).getTime();
  return Math.max(1, Math.floor(diff / 86_400_000));
}

export function FollowUpReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReminders() {
      try {
        const res = await fetch("/api/applications/reminders");
        if (!res.ok) return;
        const data = (await res.json()) as { reminders: Reminder[] };
        if (!cancelled) {
          setReminders(data.reminders);
        }
      } catch {
        // Silently ignore — the banner just won't show.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReminders();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkDone = useCallback(async (id: string) => {
    setActionInFlight(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ followedUp: true }),
      });

      if (!res.ok) {
        toast.error("Failed to mark as done.");
        return;
      }

      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Marked as followed up.");
    } catch {
      toast.error("Failed to mark as done.");
    } finally {
      setActionInFlight(null);
    }
  }, []);

  const handleSnooze = useCallback(async (id: string) => {
    setActionInFlight(id);
    try {
      const snoozedUntil = new Date(Date.now() + 3 * 86_400_000).toISOString();
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ followUpAt: snoozedUntil }),
      });

      if (!res.ok) {
        toast.error("Failed to snooze reminder.");
        return;
      }

      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Snoozed for 3 days.");
    } catch {
      toast.error("Failed to snooze reminder.");
    } finally {
      setActionInFlight(null);
    }
  }, []);

  if (loading || reminders.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
      {/* Banner header */}
      <button
        className="flex w-full items-center gap-3 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        type="button"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <Bell className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-600">
            {reminders.length} follow-up{reminders.length !== 1 ? "s" : ""} overdue
          </p>
          <p className="text-xs text-amber-600/70">
            {expanded ? "Click to collapse" : "Click to review"}
          </p>
        </div>
        <span
          className={cn(
            "text-xs text-amber-600/60 transition-transform",
            expanded && "rotate-180",
          )}
        >
          ▼
        </span>
      </button>

      {/* Expandable list */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {reminders.map((reminder) => {
            const days = daysOverdue(reminder.followUpAt);
            const isActioning = actionInFlight === reminder.id;

            return (
              <div
                key={reminder.id}
                className="flex flex-col gap-2 rounded-xl border border-amber-500/20 bg-white/60 p-3 dark:bg-black/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {reminder.companyName}
                    {reminder.roleTitle ? (
                      <span className="ml-1 text-muted-foreground">
                        &middot; {reminder.roleTitle}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-amber-600">
                    {days} day{days !== 1 ? "s" : ""} overdue
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    className="h-7 gap-1 px-2.5 text-xs"
                    disabled={isActioning}
                    onClick={() => handleMarkDone(reminder.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Check className="h-3 w-3" />
                    Mark Done
                  </Button>
                  <Button
                    className="h-7 gap-1 px-2.5 text-xs"
                    disabled={isActioning}
                    onClick={() => handleSnooze(reminder.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Clock className="h-3 w-3" />
                    Snooze 3 days
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
