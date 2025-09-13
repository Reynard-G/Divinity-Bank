import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <img
            src="/logo.svg"
            alt="Divinity Bank Logo"
            className="mx-auto mb-4 w-16"
          />
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Divinity Bank
          </h1>
          <p className="text-lg text-muted-foreground">
            Secure financial management for Minecraft servers
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/app"
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
