import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start with the free plan and tailor your first three resumes this month.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="full-name">
            Full name
          </label>
          <Input id="full-name" placeholder="Nivetha Raman" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-email">
            Email
          </label>
          <Input id="signup-email" placeholder="you@example.com" type="email" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-password">
            Password
          </label>
          <Input id="signup-password" placeholder="Create a password" type="password" />
        </div>
        <Button className="w-full">Create account</Button>
        <Button className="w-full" variant="outline">
          Sign up with Google
        </Button>
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
