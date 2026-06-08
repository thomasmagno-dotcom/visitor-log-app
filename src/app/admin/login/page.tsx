import LoginForm from "./LoginForm";
import type { SearchParams } from "@/lib/types";

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const from = (sp.from as string) || "/admin/hosts";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="mt-1 text-sm text-gray-500">Van Giessen Growers Inc.</p>
        </div>
        <LoginForm from={from} />
        <p className="mt-4 text-center text-xs text-gray-400">
          <a href="/" className="hover:underline">← Back to Visitor Sign-In</a>
        </p>
      </div>
    </div>
  );
}
