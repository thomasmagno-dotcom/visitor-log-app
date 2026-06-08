import { getDb } from "@/lib/db";
import HostManager from "./HostManager";
import LogoutButton from "@/app/admin/LogoutButton";
import Link from "next/link";

export default function HostsAdminPage() {
  const db = getDb();
  const hosts = db.prepare("SELECT * FROM hosts ORDER BY name ASC").all() as {
    id: number;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
    active: number;
  }[];

  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Hosts</h1>
            <p className="mt-1 text-sm text-gray-500">Van Giessen Growers Inc.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-green-700 hover:underline">Visitor History</Link>
            <Link href="/" className="text-sm text-gray-400 hover:underline">← Sign-In</Link>
            <LogoutButton />
          </div>
        </div>
        {!smtpConfigured && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <strong>Email notifications are not configured.</strong> Add your SMTP settings to{" "}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env.local</code>{" "}
            to enable automatic host notifications on visitor sign-in.
            <details className="mt-2 cursor-pointer">
              <summary className="font-medium hover:underline">Show required settings</summary>
              <pre className="mt-2 rounded bg-amber-100 p-3 text-xs font-mono whitespace-pre-wrap">{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Van Giessen Growers <you@gmail.com>`}</pre>
              <p className="mt-2 text-xs text-amber-700">
                For Gmail, use an <strong>App Password</strong> (not your regular password).
                Go to Google Account → Security → 2-Step Verification → App passwords.
              </p>
            </details>
          </div>
        )}
        {smtpConfigured && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-800 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Email notifications are active. Hosts with an email address will be notified on visitor sign-in.
          </div>
        )}
        <HostManager hosts={hosts} />
      </div>
    </div>
  );
}
