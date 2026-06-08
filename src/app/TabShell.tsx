"use client";

import { useState } from "react";
import SignOutSearch from "./SignOutSearch";

type Tab = "signin" | "signout";

export default function TabShell({
  signInForm,
}: {
  signInForm: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("signin");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex rounded-xl border border-gray-200 bg-gray-100 p-1">
        <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </TabButton>
        <TabButton active={tab === "signout"} onClick={() => setTab("signout")}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </TabButton>
      </div>

      {tab === "signin" && signInForm}
      {tab === "signout" && <SignOutSearch />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
