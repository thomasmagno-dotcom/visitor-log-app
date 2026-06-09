"use client";

import { useState, useTransition } from "react";
import { updatePolicy } from "./actions";

type Policy = {
  id: number;
  key: string;
  title: string;
  version: string;
  effective_date: string;
  body: string;
  updated_at: string;
};

export default function PolicyEditor({ policy }: { policy: Policy }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await updatePolicy(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  const updated = new Date(policy.updated_at).toLocaleString("en-CA", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={policy.id} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Policy Title</label>
          <input
            name="title"
            defaultValue={policy.title}
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Version</label>
          <input
            name="version"
            defaultValue={policy.version}
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Effective Date</label>
        <input
          name="effective_date"
          type="date"
          defaultValue={policy.effective_date}
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 w-48"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Policy Body</label>
        <textarea
          name="body"
          defaultValue={policy.body}
          required
          rows={20}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono leading-relaxed focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          Policy saved successfully.
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Last updated: {updated}</p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isPending ? "Saving…" : "Save Policy"}
        </button>
      </div>
    </form>
  );
}
