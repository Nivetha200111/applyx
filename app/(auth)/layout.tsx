import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hidden border-r border-border/70 bg-slate-950 px-10 py-12 text-slate-100 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-6">
          <Link className="text-lg font-semibold" href="/">
            ApplyX
          </Link>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight">
              Build faster, more relevant resumes for every application.
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-300">
              ApplyX is built for high-volume job searches where every application needs a
              better ATS fit without wasting 20 minutes in a chatbot.
            </p>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-7 text-slate-400">
          Free plan includes 3 tailored resumes every month. Upgrade only when your
          application volume demands it.
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
