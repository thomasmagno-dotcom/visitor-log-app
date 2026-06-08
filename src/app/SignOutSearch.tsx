"use client";

import { useState, useTransition, useRef } from "react";
import { searchSignedIn, selfSignOut } from "./actions";

type Match = {
  id: number;
  name: string;
  company: string;
  host: string;
  signed_in_at: string;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function SignOutSearch() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Match[] | null>(null);
  const [searching, startSearch] = useTransition();
  const [signingOut, startSignOut] = useTransition();
  const [signedOutName, setSignedOutName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) return;
    startSearch(async () => {
      const matches = await searchSignedIn(query.trim());
      setResults(matches);
    });
  }

  function handleSignOut(id: number, name: string) {
    if (!confirm(`Sign out ${name}?`)) return;
    startSignOut(async () => {
      await selfSignOut(id);
      setSignedOutName(name);
      setResults(null);
      setQuery("");
    });
  }

  function reset() {
    setSignedOutName(null);
    setQuery("");
    setResults(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // ── Success state ─────────────────────────────────────────────────
  if (signedOutName) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            Goodbye, {signedOutName}!
          </p>
          <p className="mt-1 text-sm text-gray-500">
            You have been successfully signed out. Have a safe trip!
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResults(null); }}
          placeholder="Start typing your name…"
          autoComplete="off"
          required
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Results */}
      {results !== null && (
        results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">No one signed in matches &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-xs text-gray-400">Make sure you are currently signed in, or check the spelling of your name.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">{results.length} match{results.length !== 1 ? "es" : ""} — select your name to sign out</p>
            {results.map((r) => (
              <div key={r.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 gap-4 shadow-sm">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {r.company} &nbsp;·&nbsp; Host: {r.host} &nbsp;·&nbsp; In at {formatTime(r.signed_in_at)}, {formatDate(r.signed_in_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleSignOut(r.id, r.name)}
                  disabled={signingOut}
                  className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {signingOut ? "…" : "Sign Out"}
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
