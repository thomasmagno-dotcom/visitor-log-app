"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function ExportBar({
  from, to, search,
}: {
  from: string; to: string; search: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function params() {
    const p = new URLSearchParams();
    if (from)   p.set("from",   from);
    if (to)     p.set("to",     to);
    if (search) p.set("search", search);
    return p.toString();
  }

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = new URLSearchParams();
    const f = fd.get("from") as string;
    const t = fd.get("to") as string;
    const s = fd.get("search") as string;
    if (f) p.set("from", f);
    if (t) p.set("to", t);
    if (s) p.set("search", s);
    router.push(`/history?${p.toString()}`);
  }

  function download(format: "csv" | "xlsx") {
    const qs = params();
    window.location.href = `/api/export?format=${format}${qs ? `&${qs}` : ""}`;
  }

  function openPrint() {
    const qs = params();
    window.open(`/history/print${qs ? `?${qs}` : ""}`, "_blank");
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <form ref={formRef} onSubmit={handleFilter} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">From</label>
          <input
            name="from"
            type="date"
            defaultValue={from}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">To</label>
          <input
            name="to"
            type="date"
            defaultValue={to}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs text-gray-500 font-medium">Search</label>
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Name, company, or host…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
        >
          Filter
        </button>
        <button
          type="button"
          onClick={() => router.push("/history")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Clear
        </button>
      </form>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-gray-400 font-medium uppercase tracking-wide mr-1">Export:</span>
        <button
          onClick={() => download("csv")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <CsvIcon /> CSV
        </button>
        <button
          onClick={() => download("xlsx")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-100 shadow-sm"
        >
          <XlsxIcon /> Excel (.xlsx)
        </button>
        <button
          onClick={openPrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 shadow-sm"
        >
          <PdfIcon /> PDF / Print
        </button>
      </div>
    </div>
  );
}

function CsvIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function XlsxIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}
