"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prepResourceCatalog, prepCategoryLabels } from "@/lib/prep-resources";
import type { PrepResource, TrackedApplicationRecord } from "@/lib/types";

interface ApplicationDetailProps {
  app: TrackedApplicationRecord;
  onUpdate: (id: string, field: string, value: unknown) => void;
}

export function ApplicationDetail({ app, onUpdate }: ApplicationDetailProps) {
  const [notes, setNotes] = useState(app.notes ?? "");
  const [notesTimer, setNotesTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleNotesChange(value: string) {
    setNotes(value);
    if (notesTimer) clearTimeout(notesTimer);
    setNotesTimer(
      setTimeout(() => {
        onUpdate(app.id, "notes", value || null);
      }, 600),
    );
  }

  const resources: PrepResource[] =
    app.prepResources.length > 0 ? app.prepResources : prepResourceCatalog.slice(0, 8);

  const grouped = resources.reduce<Record<string, PrepResource[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      {/* Left: Details + Notes */}
      <div className="min-w-0 space-y-4">
        {/* Skills */}
        {app.requiredSkills.length > 0 ? (
          <div className="rounded-[24px] border border-border/60 bg-background/30 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Required Skills
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {app.requiredSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="max-w-full whitespace-normal break-words text-left text-xs leading-5"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {app.preferredSkills.length > 0 ? (
          <div className="rounded-[24px] border border-border/60 bg-background/30 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preferred Skills
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {app.preferredSkills.map((skill) => (
                <Badge
                  key={skill}
                  className="max-w-full whitespace-normal break-words text-left text-xs leading-5"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {app.experienceRequired ? (
          <div className="rounded-[24px] border border-border/60 bg-background/30 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Experience
            </div>
            <p className="mt-1 text-sm text-foreground">{app.experienceRequired}</p>
          </div>
        ) : null}

        {/* Contact info */}
        <div className="grid gap-3 rounded-[24px] border border-border/60 bg-background/30 p-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`contact-${app.id}`}>
              Contact
            </label>
            <input
              className="w-full rounded-lg border border-border/70 bg-card/50 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
              defaultValue={app.contactName ?? ""}
              id={`contact-${app.id}`}
              onBlur={(e) => onUpdate(app.id, "contactName", e.target.value || null)}
              placeholder="Recruiter name"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`contact-email-${app.id}`}>
              Email
            </label>
            <input
              className="w-full rounded-lg border border-border/70 bg-card/50 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
              defaultValue={app.contactEmail ?? ""}
              id={`contact-email-${app.id}`}
              onBlur={(e) => onUpdate(app.id, "contactEmail", e.target.value || null)}
              placeholder="recruiter@company.com"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1 rounded-[24px] border border-border/60 bg-background/30 p-4">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`notes-${app.id}`}>
            Notes
          </label>
          <textarea
            className="w-full rounded-2xl border border-border/70 bg-card/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            id={`notes-${app.id}`}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Interview prep notes, referral info, follow-up reminders..."
            rows={3}
            value={notes}
          />
        </div>
      </div>

      {/* Right: Prep Resources */}
      <div className="min-w-0 space-y-4 rounded-[24px] border border-border/60 bg-background/30 p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Preparation Resources
        </div>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/85">
              {prepCategoryLabels[category as PrepResource["category"]] ?? category}
            </div>
            <div className="space-y-1">
              {items.map((resource) => (
                <a
                  key={resource.url}
                  className="flex items-start gap-2 rounded-xl border border-transparent px-3 py-2 text-sm leading-6 text-muted-foreground transition-colors hover:border-border/60 hover:bg-card/70 hover:text-foreground"
                  href={resource.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="mt-1 h-3 w-3 shrink-0" />
                  <span className="min-w-0 break-words">{resource.label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
