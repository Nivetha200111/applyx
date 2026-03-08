import { requireUser } from "@/lib/auth";
import { getUsageLogForUser } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusVariant = {
  demo: "warning",
  parse_resume: "outline",
  parse_job_description: "outline",
  parse_tracker_jd: "outline",
  tailor_resume: "success",
  generate_pdf: "default",
  generate_docx: "default",
  download: "default",
  login: "outline",
  purchase: "success",
} as const;

export default async function HistoryPage() {
  const user = await requireUser("/history");
  const usageLog = await getUsageLogForUser(user.id, 30);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Activity history</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Resume parsing, tailoring, downloads, sign-ins, and purchases are all tracked
          here.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            This becomes the source of truth for product usage and billing history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageLog.length === 0 ? (
            <p className="text-sm leading-7 text-muted-foreground">
              No activity recorded yet.
            </p>
          ) : (
            usageLog.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-card/80 p-4 transition-all duration-200 hover:-translate-y-1 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold">{entry.action.replaceAll("_", " ")}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
                <Badge variant={statusVariant[entry.action]}>
                  {entry.planTier} • {entry.modelTier}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
