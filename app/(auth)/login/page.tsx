import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sanitizeNextPath } from "@/lib/validations/auth";

export default function LoginPage({
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
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Access your master resumes, tailored versions, and plan usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <LoginForm next={next} />
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link className="font-medium text-foreground" href="/signup">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
