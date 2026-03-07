import Link from "next/link";
import { AuthMessage } from "@/components/auth/auth-message";
import { OAuthButton } from "@/components/auth/oauth-button";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signUpAction } from "@/app/(auth)/actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams?: {
    error?: string;
    success?: string;
    next?: string;
  };
}) {
  const next = searchParams?.next?.startsWith("/") ? searchParams.next : "/dashboard";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start with the free plan and tailor your first three resumes this month.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {searchParams?.error ? (
          <AuthMessage message={searchParams.error} tone="error" />
        ) : null}
        {searchParams?.success ? (
          <AuthMessage message={searchParams.success} tone="success" />
        ) : null}
        <form action={signUpAction} className="space-y-5">
          <input name="next" type="hidden" value={next} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="full-name">
              Full name
            </label>
            <Input
              autoComplete="name"
              id="full-name"
              name="full_name"
              placeholder="Nivetha Raman"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-email">
              Email
            </label>
            <Input
              autoComplete="email"
              id="signup-email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="signup-password">
              Password
            </label>
            <Input
              autoComplete="new-password"
              id="signup-password"
              minLength={8}
              name="password"
              placeholder="Create a password"
              required
              type="password"
            />
          </div>
          <SubmitButton className="w-full" pendingLabel="Creating account...">
            Create account
          </SubmitButton>
        </form>
        <OAuthButton label="Sign up with Google" next={next} />
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
