import { getDb } from "@/lib/db";
import Link from "next/link";
import ExportBar from "./ExportBar";
import LogoutButton from "@/app/admin/LogoutButton";
import type { SearchParams } from "@/lib/types";

type Visitor = {
  id: number;
  name: string;
  company: string;
  purpose: string;
  host: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  signed_in_at: string;
  signed_out_at: string | null;
};

function fmt(iso: string, type: "date" | "time") {
  const d = new Date(iso);
  if (type === "date")
    return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
  return d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function dur(signedIn: string, signedOut: string | null) {
  if (!signedOut) return null;
  const ms = new Date(signedOut).getTime() - new Date(signedIn).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default async function HistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const from   = (sp.from   as string) || "";
  const to     = (sp.to     as string) || "";
  const search = (sp.search as string) || "";

  const db = getDb();
  const conditions: string[] = [];
  const params: string[] = [];
  if (from)   { conditions.push("DATE(signed_in_at) >= ?"); params.push(from); }
  if (to)     { conditions.push("DATE(signed_in_at) <= ?"); params.push(to); }
  if (search) {
    conditions.push("(name LIKE ? OR company LIKE ? OR host LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const visitors = db
    .prepare(`SELECT * FROM visitors ${where} ORDER BY signed_in_at DESC`)
    .all(...params) as Visitor[];

  const total = (db.prepare(`SELECT COUNT(*) as n FROM visitors`).get() as { n: number }).n;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visitor History</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Van Giessen Growers Inc. &nbsp;·&nbsp;
              <span className="font-medium text-gray-700">{visitors.length}</span>
              {visitors.length !== total && (
                <> of <span className="font-medium text-gray-700">{total}</span> total</>
              )} record{visitors.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/log" className="text-green-700 hover:underline">Live Log</Link>
            <Link href="/admin/hosts" className="text-green-700 hover:underline">Manage Hosts</Link>
            <Link href="/" className="text-gray-400 hover:underline">← Sign-In</Link>
            <LogoutButton />
          </div>
        </div>

        {/* Filter + export bar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <ExportBar from={from} to={to} search={search} />
        </div>

        {/* Table */}
        {visitors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center text-sm text-gray-400">
            No records match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Photo</th>
                  <th className="px-4 py-3 text-left">Visitor</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Purpose of Visit</th>
                  <th className="px-4 py-3 text-left">Host</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time In</th>
                  <th className="px-4 py-3 text-left">Time Out</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visitors.map((v, i) => {
                  const d = dur(v.signed_in_at, v.signed_out_at);
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{visitors.length - i}</td>
                      <td className="px-4 py-2">
                        {v.photo
                          ? <img src={`/api/photos/${v.photo}`} alt={v.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                          : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs">N/A</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                      <td className="px-4 py-3 text-gray-600">{v.company}</td>
                      <td className="px-4 py-3 text-gray-600">{v.purpose}</td>
                      <td className="px-4 py-3 text-gray-600">{v.host}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {v.email
                          ? <a href={`mailto:${v.email}`} className="text-blue-600 hover:underline">{v.email}</a>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {v.phone
                          ? <a href={`tel:${v.phone}`} className="hover:underline">{v.phone}</a>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{fmt(v.signed_in_at, "date")}</td>
                      <td className="px-4 py-3 text-gray-500">{fmt(v.signed_in_at, "time")}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {v.signed_out_at
                          ? fmt(v.signed_out_at, "time")
                          : <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">On Site</span>}
                      </td>
                      <td className="px-4 py-3">
                        {d
                          ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{d}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
