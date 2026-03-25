"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const router = useRouter();

  const [movie, setMovie] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/me/movie", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movie }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save movie.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="movie"
          className="block text-sm font-medium text-gray-700"
        >
          Favorite movie
        </label>
        <input
          id="movie"
          type="text"
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
          maxLength={100}
          placeholder="Enter your favorite movie"
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save and continue"}
      </button>
    </form>
  );
}