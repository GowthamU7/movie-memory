import { getSession } from "../../lib/session";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/auth/logout-button";
import FactCard from "../../components/dashboard/fact-card";
import Image from "next/image";

export default async function DashboardPage() {
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

  if (!user.favoriteMovie) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md border">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User photo"}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-700">
                {(user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome, {user.name ?? "User"}
              </p>
            </div>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl border p-6">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Name:</span>{" "}
            {user.name ?? "No name provided"}
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-medium">Email:</span> {user.email}
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-medium">Favorite Movie:</span>{" "}
            {user.favoriteMovie}
          </p>
        </div>

        <FactCard />
      </div>
    </main>
  );
}