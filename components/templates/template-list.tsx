"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Linkedin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fillTemplate,
  templateCategories,
  templates,
  type MessageTemplate,
} from "@/lib/message-templates";
import { cn } from "@/lib/utils";

type CategoryFilter = MessageTemplate["category"] | "all";

const categoryFilters: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cold-outreach", label: "Cold Outreach" },
  { value: "referral-request", label: "Referral Request" },
  { value: "follow-up", label: "Follow-up" },
  { value: "thank-you", label: "Thank You" },
];

const placeholderSplitRe = /(\{[a-zA-Z]+\})/g;
const placeholderTestRe = /\{[a-zA-Z]+\}/;

function highlightPlaceholders(text: string) {
  const parts = text.split(placeholderSplitRe);
  return parts.map((part, i) =>
    placeholderTestRe.test(part) ? (
      <span
        key={i}
        className="rounded-md bg-amber-100 px-1 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function TemplateList() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [vars, setVars] = useState<Record<string, string>>({
    name: "",
    company: "",
    role: "",
    contactName: "",
  });

  const filtered =
    category === "all"
      ? templates
      : templates.filter((t) => t.category === category);

  const updateVar = useCallback((key: string, value: string) => {
    setVars((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Variable inputs */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="var-name">
                Your Name
              </label>
              <Input
                id="var-name"
                onChange={(e) => updateVar("name", e.target.value)}
                placeholder="Jane Doe"
                value={vars.name}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="var-company">
                Company
              </label>
              <Input
                id="var-company"
                onChange={(e) => updateVar("company", e.target.value)}
                placeholder="Acme Inc."
                value={vars.company}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="var-role">
                Role
              </label>
              <Input
                id="var-role"
                onChange={(e) => updateVar("role", e.target.value)}
                placeholder="Software Engineer"
                value={vars.role}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="var-contact">
                Contact Name
              </label>
              <Input
                id="var-contact"
                onChange={(e) => updateVar("contactName", e.target.value)}
                placeholder="Alex Smith"
                value={vars.contactName}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {categoryFilters.map((f) => (
          <button
            key={f.value}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === f.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/70 text-muted-foreground hover:border-primary/40",
            )}
            onClick={() => setCategory(f.value)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            expanded={expandedId === template.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === template.id ? null : template.id))
            }
            template={template}
            vars={vars}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No templates found for this category.
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  vars,
  expanded,
  onToggle,
}: {
  template: MessageTemplate;
  vars: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const filled = fillTemplate(template, vars);
  const hasUnfilled =
    placeholderTestRe.test(filled.subject) ||
    placeholderTestRe.test(filled.body);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        expanded && "ring-2 ring-primary/30",
      )}
    >
      <CardHeader className="pb-3" onClick={onToggle}>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">{template.title}</CardTitle>
          <div className="flex shrink-0 items-center gap-1.5">
            <ChannelBadge channel={template.channel} />
            <Badge variant="outline" className="text-[10px]">
              {templateCategories[template.category]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {template.channel === "email" && filled.subject && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Subject</span>
                <CopyButton label="Copy Subject" text={filled.subject} />
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-relaxed">
                {hasUnfilled
                  ? highlightPlaceholders(filled.subject)
                  : filled.subject}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Message</span>
              <CopyButton label="Copy Message" text={filled.body} />
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-relaxed whitespace-pre-line">
              {hasUnfilled ? highlightPlaceholders(filled.body) : filled.body}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ChannelBadge({ channel }: { channel: MessageTemplate["channel"] }) {
  if (channel === "email") {
    return (
      <Badge variant="default" className="gap-1 text-[10px]">
        <Mail className="h-3 w-3" />
        Email
      </Badge>
    );
  }

  return (
    <Badge
      className="gap-1 border border-sky-300/70 bg-sky-100 text-[10px] text-sky-800 dark:border-sky-400/50 dark:bg-sky-900/40 dark:text-sky-300"
    >
      <Linkedin className="h-3 w-3" />
      LinkedIn
    </Badge>
  );
}

function CopyButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // clipboard API may fail in some contexts — silently ignore
      }
    },
    [text],
  );

  return (
    <Button
      className="h-7 gap-1.5 px-2.5 text-xs"
      onClick={handleCopy}
      size="sm"
      variant="outline"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {label}
        </>
      )}
    </Button>
  );
}
