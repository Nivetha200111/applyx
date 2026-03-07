import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchScoreProps {
  before: number;
  after: number;
}

function ScoreRing({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] border border-border/70 bg-white/80 p-5">
      <div
        className="grid h-28 w-28 place-items-center rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${score * 3.6}deg, rgba(15, 23, 42, 0.08) 0deg)`,
        }}
      >
        <div className="grid h-20 w-20 place-items-center rounded-full bg-background text-center">
          <div>
            <div className="text-2xl font-semibold">{score}</div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchScore({ before, after }: MatchScoreProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ATS Match Score</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <ScoreRing label="Before" score={before} />
        <ScoreRing label="After" score={after} />
      </CardContent>
    </Card>
  );
}
