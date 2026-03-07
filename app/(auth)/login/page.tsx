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
import { signInAction } from "@/app/(auth)/actions";

export default function LoginPage({
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
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Access your master resumes, tailored versions, and usage history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {searchParams?.error ? (
          <AuthMessage message={searchParams.error} tone="error" />
        ) : null}
        {searchParams?.success ? (
          <AuthMessage message={searchParams.success} tone="success" />
        ) : null}
        <form action={signInAction} className="space-y-5">
          <input name="next" type="hidden" value={next} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              autoComplete="current-password"
              id="password"
              minLength={8}
              name="password"
              placeholder="Enter your password"
              required
              type="password"
            />
          </div>
          <SubmitButton className="w-full" pendingLabel="Signing in...">
            Continue
          </SubmitButton>
        </form>
        <OAuthButton label="Continue with Google" next={next} />
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
