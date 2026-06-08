"use client";

import { useTransition } from "react";
import { signOut } from "@/app/actions";

export default function SignOutButton({ id, name }: { id: number; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Sign out ${name}?`)) return;
    startTransition(() => signOut(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Signing out…" : "Sign Out"}
    </button>
  );
}
