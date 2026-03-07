import { demoTailorResult } from "@/lib/demo-data";
import { ChangesDiff } from "@/components/changes-diff";
import { MatchScore } from "@/components/match-score";
import { ResumePreview } from "@/components/resume-preview";
import { TemplatePicker } from "@/components/template-picker";

export default function TailoredResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Tailored resume detail</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Viewing <span className="font-medium text-foreground">{params.id}</span>. This
          page is wired to the v2 preview shell and will connect to generated assets in
          later steps.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <MatchScore
            before={demoTailorResult.match_score_before}
            after={demoTailorResult.match_score_after}
          />
          <TemplatePicker selected="classic" />
          <ChangesDiff changes={demoTailorResult.changes} />
        </div>
        <ResumePreview resume={demoTailorResult.tailored_resume} />
      </div>
    </div>
  );
}
