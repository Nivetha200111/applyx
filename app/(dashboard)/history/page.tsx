import { applicationHistory } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusVariant = {
  Applied: "default",
  Interviewing: "success",
  Saved: "outline",
} as const;

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Application history</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Step 1 includes the history shell for storing tailored outputs, source channels,
          and application status updates.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            This view becomes the source of truth for versioned resumes and job tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicationHistory.map((entry) => (
            <div
              key={`${entry.company}-${entry.role}`}
              className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-card/80 p-4 transition-all duration-200 hover:-translate-y-1 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-semibold">
                  {entry.company} • {entry.role}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {entry.date} • {entry.source}
                </div>
              </div>
              <Badge variant={statusVariant[entry.status as keyof typeof statusVariant]}>
                {entry.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
