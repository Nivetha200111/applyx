import Link from "next/link";
import { tailoredResumeCards } from "@/lib/demo-data";
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

export default function TailoredResumesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Tailored resumes</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Every tailored output keeps its own match score, template selection, and job
          context so users can compare versions over time.
        </p>
      </div>
      <div className="grid gap-4">
        {tailoredResumeCards.map((resume) => (
          <Card key={resume.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{resume.role}</CardTitle>
                  <CardDescription>
                    {resume.company} • {resume.createdAt} • {resume.template}
                  </CardDescription>
                </div>
                <Badge variant="success">{resume.matchScore} match</Badge>
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
        ))}
      </div>
    </div>
  );
}
