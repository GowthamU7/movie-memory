import { getSession } from "../lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-md border">
        <h1 className="text-4xl font-bold text-gray-900">Movie Memory</h1>
        <p className="mt-4 text-gray-600">
          Save your favorite movie, view your profile, and generate fun facts powered by AI.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-black px-5 py-3 text-white text-sm font-medium hover:opacity-90 transition"
          >
            Sign in with Google
          </Link>
        </div>
      </div>
    </main>
  );
}