import { getDb, initDb } from "@/lib/db";
import HostManager from "./HostManager";
import LogoutButton from "@/app/admin/LogoutButton";
import Link from "next/link";

export default async function HostsAdminPage() {
  await initDb();
  const db = getDb();
  const result = await db.execute("SELECT * FROM hosts ORDER BY name ASC");
  const hosts = result.rows as unknown as {
    id: number;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
    active: number;
  }[];

  const smtpConfigured = !!process.env.RESEND_API_KEY;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Hosts</h1>
            <p className="mt-1 text-sm text-gray-500">Van Giessen Growers Inc.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/policies" className="text-sm text-green-700 hover:underline">Manage Policies</Link>
            <Link href="/history" className="text-sm text-green-700 hover:underline">Visitor History</Link>
            <Link href="/" className="text-sm text-gray-400 hover:underline">← Sign-In</Link>
            <LogoutButton />
          </div>
        </div>

        {/* SMTP status banner */}
        {smtpConfigured ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
            <span>✅</span>
            <span>Email notifications are <strong>enabled</strong>. Hosts will be emailed when a visitor signs in.</span>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">⚠️ Email notifications are not configured.</p>
            <p>Set <code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code> in your Vercel environment variables to enable host email alerts.</p>
          </div>
        )}

        <HostManager hosts={hosts} />
      </div>
    </div>
  );
}
