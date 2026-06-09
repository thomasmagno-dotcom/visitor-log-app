import { getDb, initDb, type Policy } from "@/lib/db";
import SignInForm from "./SignInForm";
import TabShell from "./TabShell";

export default async function Home() {
  await initDb();
  const db = getDb();

  const hostsResult = await db.execute(
    "SELECT id, name, title FROM hosts WHERE active = 1 ORDER BY name ASC"
  );
  const hosts = hostsResult.rows as unknown as { id: number; name: string; title: string | null }[];

  const policiesResult = await db.execute("SELECT * FROM policies ORDER BY id ASC");
  const policies = policiesResult.rows as unknown as Policy[];
  const gmpPolicy = policies.find((p) => p.key === "gmp")!;
  const cdPolicy  = policies.find((p) => p.key === "communicable_disease")!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-950 flex flex-col items-center justify-start px-4 py-10">

      {/* ── Brand header ── */}
      <header className="w-full max-w-2xl flex flex-col items-center mb-6">
        <div className="flex items-center gap-3 mb-2">
          <CarrotIcon className="h-10 w-10 drop-shadow-lg" />
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
              Van Giessen Growers Inc.
            </h1>
            <p className="text-green-300 text-sm font-medium tracking-wide">
              Fresh from the field since 1978
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full mt-2">
          <div className="flex-1 h-px bg-green-600/50" />
          <span className="text-green-400 text-lg select-none">🌿</span>
          <span className="text-orange-400 text-lg select-none">🥕</span>
          <span className="text-green-400 text-lg select-none">🌿</span>
          <div className="flex-1 h-px bg-green-600/50" />
        </div>
      </header>

      {/* ── Welcome banner ── */}
      <div className="w-full max-w-2xl mb-5">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-5 shadow-lg flex gap-4 items-start">
          <span className="text-3xl select-none mt-0.5">👋</span>
          <div>
            <h2 className="text-white font-bold text-lg leading-snug">
              Welcome to Van Giessen Growers!
            </h2>
            <p className="text-orange-100 text-sm mt-1 leading-relaxed">
              All visitors are required to sign in before entering the facility.
              Please complete the steps below — it only takes a minute.
            </p>
          </div>
        </div>
      </div>

      {/* ── Step instructions ── */}
      <div className="w-full max-w-2xl mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { n: "1", icon: "📸", label: "Take a photo" },
            { n: "2", icon: "📋", label: "Fill in your info" },
            { n: "3", icon: "📄", label: "Read our policies" },
            { n: "4", icon: "✅", label: "Tap Sign In" },
          ].map(({ n, icon, label }) => (
            <div
              key={n}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-3 text-center"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-bold text-green-200 uppercase tracking-wider">
                Step {n}
              </span>
              <span className="text-xs text-white font-medium leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main form card ── */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-500 via-orange-400 to-green-500" />
        <div className="p-8">
          <TabShell signInForm={<SignInForm hosts={hosts} gmpPolicy={gmpPolicy} cdPolicy={cdPolicy} />} />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="w-full max-w-2xl mt-6 flex items-center justify-between text-xs text-green-500">
        <span>🥕 Van Giessen Growers Inc. &nbsp;·&nbsp; Visitor Management</span>
        <a href="/log" className="hover:text-green-300 transition-colors">Live Log →</a>
      </footer>

    </div>
  );
}

function CarrotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 16 C16 24 14 36 18 48 C20 54 26 58 30 56 C34 54 38 48 38 40 C42 32 44 20 40 14 C36 8 24 8 20 16Z" fill="#f97316" />
      <path d="M26 18 C24 24 23 32 24 40" stroke="#fed7aa" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 14 C28 6 20 4 16 8 C20 10 26 14 30 14Z" fill="#16a34a" />
      <path d="M30 14 C32 4 42 2 44 8 C40 10 34 14 30 14Z" fill="#15803d" />
      <path d="M30 14 C30 6 34 0 38 4 C36 8 32 12 30 14Z" fill="#22c55e" />
    </svg>
  );
}
