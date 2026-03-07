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

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Access your master resumes, tailored versions, and usage history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input id="email" placeholder="you@example.com" type="email" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input id="password" placeholder="Enter your password" type="password" />
        </div>
        <Button className="w-full">Continue</Button>
        <Button className="w-full" variant="outline">
          Continue with Google
        </Button>
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
