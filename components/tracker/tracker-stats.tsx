import { Briefcase, CheckCircle2, MailQuestion, Target } from "lucide-react";

interface TrackerStatsProps {
  stats: {
    total: number;
    byStatus: Record<string, number>;
    responseRate: number;
    signalsReady: number;
    highConfidence: number;
  };
}

export function TrackerStats({ stats }: TrackerStatsProps) {
  const applied =
    (stats.byStatus.applied ?? 0) +
    (stats.byStatus.screening ?? 0) +
    (stats.byStatus.interviewing ?? 0) +
    (stats.byStatus.offer ?? 0) +
    (stats.byStatus.accepted ?? 0) +
    (stats.byStatus.rejected ?? 0) +
    (stats.byStatus.ghosted ?? 0);
  const interviewing = (stats.byStatus.interviewing ?? 0) + (stats.byStatus.screening ?? 0);
  const offers = (stats.byStatus.offer ?? 0) + (stats.byStatus.accepted ?? 0);

  const items = [
    { label: "Total tracked", value: stats.total, icon: Briefcase },
    { label: "Applied", value: applied, icon: CheckCircle2 },
    { label: "Interviewing", value: interviewing, icon: MailQuestion },
    { label: "Offers", value: offers, icon: Target },
    { label: "Signals ready", value: stats.signalsReady, icon: CheckCircle2 },
    { label: "High confidence", value: stats.highConfidence, icon: Target },
    { label: "Response rate", value: `${stats.responseRate}%`, icon: Target },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-[24px] border border-border/70 bg-card/80 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
