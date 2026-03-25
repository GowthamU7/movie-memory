"use client";

import { useEffect, useState } from "react";

type FactResponse = {
  fact?: string;
  createdAt?: string;
  source?: string;
  error?: string;
};

export default function FactCard() {
  const [fact, setFact] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadFact() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/fact", {
        method: "GET",
      });

      const data: FactResponse = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load fact.");
        return;
      }

      setFact(data.fact || "");
      setSource(data.source || "");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading the fact.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFact();
  }, []);

  return (
    <div className="mt-8 rounded-2xl border bg-gray-50 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Fun Movie Fact</h2>
        <button
          onClick={loadFact}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Refresh Fact
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-gray-600">Loading fact...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-sm leading-6 text-gray-700">{fact}</p>
            <p className="mt-3 text-xs text-gray-500">Source: {source}</p>
          </>
        )}
      </div>
    </div>
  );
}