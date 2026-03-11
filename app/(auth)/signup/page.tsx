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
    source?: string | string[];
    slug?: string | string[];
  };
}) {
  const next = sanitizeNextPath(searchParams?.next);
  const source = typeof searchParams?.source === "string" ? searchParams.source : null;
  const slug = typeof searchParams?.slug === "string" ? searchParams.slug : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start free, upload your resume once, and tailor job applications in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SignupForm next={next} source={source} slug={slug} />
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
