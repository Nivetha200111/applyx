import Link from "next/link";
import { notFound } from "next/navigation";
import { ChangesDiff } from "@/components/changes-diff";
import { MatchScore } from "@/components/match-score";
import { ResumePreview } from "@/components/resume-preview";
import { TemplatePicker } from "@/components/template-picker";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getTailoredResumeForUser } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function TailoredResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser(`/tailored/${params.id}`);
  const tailored = await getTailoredResumeForUser(user.id, params.id);

  if (!tailored) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">Tailored resume detail</h1>
          <Badge variant="success">{tailored.matchScoreAfter ?? 0}% match</Badge>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          {tailored.jobTitle ?? "Untitled role"} • {tailored.companyName ?? "Company"} •{" "}
          Generated {new Date(tailored.createdAt).toLocaleString("en-IN")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            className={cn(buttonVariants({ size: "sm" }))}
            href={`/api/tailored/${tailored.id}/download?format=pdf`}
          >
            Download PDF
          </Link>
          <Link
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            href={`/api/tailored/${tailored.id}/download?format=docx`}
          >
            Download DOCX
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <MatchScore
            after={tailored.matchScoreAfter ?? 0}
            before={tailored.matchScoreBefore ?? 0}
          />
          <TemplatePicker selected={tailored.templateUsed} />
          <ChangesDiff changes={tailored.changes} />
        </div>
        <ResumePreview resume={tailored.tailoredData} template={tailored.templateUsed} />
      </div>
    </div>
  );
}
