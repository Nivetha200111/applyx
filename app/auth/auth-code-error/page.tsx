import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Authentication link expired</CardTitle>
          <CardDescription>
            The sign-in or confirmation link could not be verified. Start the auth flow
            again and Supabase will issue a fresh link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link className="w-full" href="/login">
            <Button className="w-full">Go to login</Button>
          </Link>
          <Link className="w-full" href="/signup">
            <Button className="w-full" variant="outline">
              Create account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
