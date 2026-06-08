import { getDb } from "@/lib/db";
import SignInForm from "./SignInForm";

export default function Home() {
  const db = getDb();
  const hosts = db
    .prepare("SELECT id, name, title FROM hosts WHERE active = 1 ORDER BY name ASC")
    .all() as { id: number; name: string; title: string | null }[];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Visitor Sign-In</h1>
          <p className="mt-1 text-sm text-gray-500">Van Giessen Growers Inc.</p>
        </div>
        <SignInForm hosts={hosts} />
      </div>
    </div>
  );
}
