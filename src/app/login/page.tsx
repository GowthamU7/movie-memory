import { getSession } from "../../lib/session";
import { redirect } from "next/navigation";
import SignInButton from "../../components/auth/sign-in-button";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md border">
        <h1 className="text-3xl font-semibold text-gray-900">Movie Memory</h1>
        <p className="mt-3 text-sm text-gray-600">
          Sign in with Google to save your favorite movie and get a fun AI-generated fact.
        </p>

        <div className="mt-6">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}