import { getDb } from "@/lib/db";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import AutoRefresh from "./AutoRefresh";

type Visitor = {
  id: number;
  name: string;
  company: string;
  purpose: string;
  host: string;
  photo: string | null;
  signed_in_at: string;
  signed_out_at: string | null;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function duration(signedIn: string, signedOut: string | null): string {
  const end = signedOut ? new Date(signedOut) : new Date();
  const ms = end.getTime() - new Date(signedIn).getTime();
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function LogPage() {
  const db = getDb();

  const onSite = db
    .prepare(
      "SELECT * FROM visitors WHERE signed_out_at IS NULL ORDER BY signed_in_at DESC"
    )
    .all() as Visitor[];

  const recentOut = db
    .prepare(
      "SELECT * FROM visitors WHERE signed_out_at IS NOT NULL ORDER BY signed_out_at DESC LIMIT 20"
    )
    .all() as Visitor[];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <AutoRefresh intervalMs={30000} />

      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visitor Log</h1>
            <p className="mt-0.5 text-sm text-gray-500">Van Giessen Growers Inc. — refreshes every 30 s</p>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/history" className="text-green-700 hover:underline">Full History</Link>
            <Link href="/" className="text-gray-400 hover:underline">← Sign-In</Link>
          </div>
        </div>

        {/* Currently on site */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <h2 className="text-base font-semibold text-gray-800">
              Currently On Site
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {onSite.length}
              </span>
            </h2>
          </div>

          {onSite.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-400">
              No visitors currently on site.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Photo</th>
                    <th className="px-4 py-3 text-left">Visitor</th>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Purpose</th>
                    <th className="px-4 py-3 text-left">Host</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time In</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {onSite.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        {v.photo
                          ? <img src={`/api/photos/${v.photo}`} alt={v.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                          : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs">N/A</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                      <td className="px-4 py-3 text-gray-600">{v.company}</td>
                      <td className="px-4 py-3 text-gray-600">{v.purpose}</td>
                      <td className="px-4 py-3 text-gray-600">{v.host}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(v.signed_in_at)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatTime(v.signed_in_at)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          {duration(v.signed_in_at, null)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <SignOutButton id={v.id} name={v.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recently departed */}
        {recentOut.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-800">
              Recently Departed
              <span className="ml-2 text-xs font-normal text-gray-400">(last 20)</span>
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Photo</th>
                    <th className="px-4 py-3 text-left">Visitor</th>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Purpose</th>
                    <th className="px-4 py-3 text-left">Host</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time In</th>
                    <th className="px-4 py-3 text-left">Time Out</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOut.map((v) => (
                    <tr key={v.id} className="text-gray-500">
                      <td className="px-4 py-2">
                        {v.photo
                          ? <img src={`/api/photos/${v.photo}`} alt={v.name} className="h-10 w-10 rounded-full object-cover border border-gray-200 opacity-60" />
                          : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs">N/A</span>}
                      </td>
                      <td className="px-4 py-3 font-medium">{v.name}</td>
                      <td className="px-4 py-3">{v.company}</td>
                      <td className="px-4 py-3">{v.purpose}</td>
                      <td className="px-4 py-3">{v.host}</td>
                      <td className="px-4 py-3">{formatDate(v.signed_in_at)}</td>
                      <td className="px-4 py-3">{formatTime(v.signed_in_at)}</td>
                      <td className="px-4 py-3">{formatTime(v.signed_out_at!)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {duration(v.signed_in_at, v.signed_out_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
