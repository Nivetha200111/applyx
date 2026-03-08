import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getTailoredResumesForUser } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function TailoredResumesPage() {
  const user = await requireUser("/tailored");
  const tailoredResumes = await getTailoredResumesForUser(user.id);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Tailored resumes</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Every tailored output keeps its own match score, template selection, and job
          context so you can compare versions over time.
        </p>
      </div>

      <div className="grid gap-4">
        {tailoredResumes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm leading-7 text-muted-foreground">
              No tailored resumes yet. Generate your first tailored version from the
              dashboard.
            </CardContent>
          </Card>
        ) : (
          tailoredResumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{resume.jobTitle ?? "Untitled role"}</CardTitle>
                    <CardDescription>
                      {resume.companyName ?? "Company"} •{" "}
                      {new Date(resume.createdAt).toLocaleDateString("en-IN")} •{" "}
                      {resume.templateUsed}
                    </CardDescription>
                  </div>
                  <Badge variant="success">{resume.matchScoreAfter ?? 0} match</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  href={`/tailored/${resume.id}`}
                >
                  View tailored version
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
