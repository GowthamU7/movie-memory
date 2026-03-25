import { getSession } from "../../lib/session";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import OnboardingForm from "../../components/onboarding/onboarding-form";


export default async function OnboardingPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.favoriteMovie) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md border">
        <h1 className="text-2xl font-semibold text-gray-900">Onboarding</h1>
        <p className="mt-3 text-gray-600">
          Tell us your favorite movie to continue.
        </p>
        <OnboardingForm />
      </div>
    </main>
  );
}