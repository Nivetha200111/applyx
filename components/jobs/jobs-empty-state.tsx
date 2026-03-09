import Link from "next/link";
import { ArrowRight, RefreshCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JobsEmptyStateProps {
  hasResume: boolean;
  onRefresh?: () => void;
}

export function JobsEmptyState({ hasResume, onRefresh }: JobsEmptyStateProps) {
  if (!hasResume) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Upload a resume to unlock job matches</CardTitle>
          <CardDescription>
            ApplyX needs a parsed resume before it can score roles against your skills and
            recent experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link className={cn(buttonVariants(), "gap-2")} href="/resumes">
            Upload a resume
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>No matching jobs right now</CardTitle>
        <CardDescription>
          Try a refresh or come back later after new roles land in the external feeds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {onRefresh ? (
          <Button className="gap-2" onClick={onRefresh} variant="outline">
            <RefreshCcw className="h-4 w-4" />
            Refresh matches
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
