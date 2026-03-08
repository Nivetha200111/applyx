import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sanitizeNextPath } from "@/lib/validations/auth";

export default function SignupPage({
  searchParams,
}: {
  searchParams?: {
    next?: string;
  };
}) {
  const next = sanitizeNextPath(searchParams?.next);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start free, upload your resume once, and tailor job applications in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SignupForm next={next} />
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-medium text-foreground" href="/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
