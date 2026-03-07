import type { TailorChange } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChangesDiffProps {
  changes: TailorChange[];
}

const variantByType = {
  add: "success",
  rewrite: "default",
  reorder: "warning",
  remove: "outline",
} as const;

export function ChangesDiff({ changes }: ChangesDiffProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Log</CardTitle>
        <CardDescription>
          Every AI edit is summarized so users can verify authenticity before download.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {changes.map((change) => (
          <div
            key={`${change.type}-${change.section}-${change.description}`}
            className="rounded-[24px] border border-border/70 bg-white/70 p-4"
          >
            <div className="flex items-center gap-3">
              <Badge variant={variantByType[change.type]}>{change.type}</Badge>
              <span className="text-sm font-medium">{change.section}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {change.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
