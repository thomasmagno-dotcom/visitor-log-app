import { getDb, initDb, type Policy } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "@/app/admin/LogoutButton";
import PolicyEditor from "./PolicyEditor";

export default async function PoliciesPage() {
  await initDb();
  const db = getDb();
  const result = await db.execute("SELECT * FROM policies ORDER BY id ASC");
  const policies = result.rows as unknown as Policy[];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Policies</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Van Giessen Growers Inc. &nbsp;·&nbsp; Edits take effect immediately on the sign-in page.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin/hosts" className="text-green-700 hover:underline">Manage Hosts</Link>
            <Link href="/history" className="text-green-700 hover:underline">Visitor History</Link>
            <Link href="/" className="text-gray-400 hover:underline">← Sign-In</Link>
            <LogoutButton />
          </div>
        </div>

        {policies.length === 0 && (
          <p className="text-sm text-gray-500">No policies found. They will be seeded on next page load.</p>
        )}

        {policies.map((policy) => (
          <div key={policy.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 uppercase tracking-wide">
                {policy.key}
              </span>
              <h2 className="text-base font-semibold text-gray-800">{policy.title}</h2>
            </div>
            <div className="px-6 py-6">
              <PolicyEditor policy={policy} />
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
