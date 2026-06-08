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
    active: number;
  }[];

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
        <HostManager hosts={hosts} />
      </div>
    </div>
  );
}
