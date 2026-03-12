import { requireUser } from "@/lib/auth";
import { MockInterviewView } from "@/components/interviews/mock-interview-view";

export default async function InterviewsPage() {
  await requireUser("/interviews");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Mock Interviews</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Practice for your next interview with AI. Paste a job description and get
          role-specific questions. Your answers are scored using{" "}
          <a
            href="https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Gemini Embedding 2
          </a>{" "}
          for semantic similarity against ideal responses.
        </p>
      </div>
      <MockInterviewView />
    </div>
  );
}

