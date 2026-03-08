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
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Left: Details + Notes */}
      <div className="space-y-4">
        {/* Skills */}
        {app.requiredSkills.length > 0 ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Required Skills
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {app.requiredSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {app.preferredSkills.length > 0 ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preferred Skills
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {app.preferredSkills.map((skill) => (
                <Badge key={skill} className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {app.experienceRequired ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Experience
            </div>
            <p className="mt-1 text-sm text-foreground">{app.experienceRequired}</p>
          </div>
        ) : null}

        {/* Contact info */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`contact-${app.id}`}>
              Contact
            </label>
            <input
              className="w-full rounded-lg border border-border/70 bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
              defaultValue={app.contactName ?? ""}
              id={`contact-${app.id}`}
              onBlur={(e) => onUpdate(app.id, "contactName", e.target.value || null)}
              placeholder="Recruiter name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`contact-email-${app.id}`}>
              Email
            </label>
            <input
              className="w-full rounded-lg border border-border/70 bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
              defaultValue={app.contactEmail ?? ""}
              id={`contact-email-${app.id}`}
              onBlur={(e) => onUpdate(app.id, "contactEmail", e.target.value || null)}
              placeholder="recruiter@company.com"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`notes-${app.id}`}>
            Notes
          </label>
          <textarea
            className="w-full rounded-2xl border border-border/70 bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            id={`notes-${app.id}`}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Interview prep notes, referral info, follow-up reminders..."
            rows={3}
            value={notes}
          />
        </div>
      </div>

      {/* Right: Prep Resources */}
      <div className="space-y-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Preparation Resources
        </div>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="text-xs font-semibold text-foreground">
              {prepCategoryLabels[category as PrepResource["category"]] ?? category}
            </div>
            <div className="mt-1.5 space-y-1">
              {items.map((resource) => (
                <a
                  key={resource.url}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  href={resource.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  {resource.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
