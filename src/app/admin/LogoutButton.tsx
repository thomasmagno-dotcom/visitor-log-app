"use client";

import { useTransition } from "react";
import { logout } from "./login/actions";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
    >
      {isPending ? "Signing out…" : "Sign Out"}
    </button>
  );
}
