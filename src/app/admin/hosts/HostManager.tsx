"use client";

import { useState, useTransition } from "react";
import { addHost, updateHost, toggleHost, deleteHost } from "./actions";

type Host = {
  id: number;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  active: number;
};

export default function HostManager({ hosts }: { hosts: Host[] }) {
  return (
    <div className="space-y-6">
      <AddHostForm />
      <HostList hosts={hosts} />
    </div>
  );
}

function AddHostForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await addHost(formData);
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Add New Host</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input name="name"  type="text"  placeholder="Full name *" required
          className={input} />
        <input name="title" type="text"  placeholder="Job title"
          className={input} />
        <input name="email" type="email" placeholder="Email address (for notifications)"
          className={input} />
        <input name="phone" type="tel"   placeholder="Phone number"
          className={input} />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isPending}
          className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
          {isPending ? "Adding…" : "Add Host"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}

function HostList({ hosts }: { hosts: Host[] }) {
  if (hosts.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No hosts yet. Add one above.</p>;
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
      {hosts.map((host) => <HostRow key={host.id} host={host} />)}
    </div>
  );
}

function HostRow({ host }: { host: Host }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(host.id));
    startTransition(async () => { await updateHost(formData); setEditing(false); });
  }

  function handleToggle() {
    startTransition(() => toggleHost(host.id, host.active === 0));
  }

  function handleDelete() {
    if (!confirm(`Remove ${host.name} from the host list?`)) return;
    startTransition(() => deleteHost(host.id));
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name"  type="text"  defaultValue={host.name}        required placeholder="Full name" className={input} />
          <input name="title" type="text"  defaultValue={host.title ?? ""}          placeholder="Job title"  className={input} />
          <input name="email" type="email" defaultValue={host.email ?? ""}          placeholder="Email address" className={input} />
          <input name="phone" type="tel"   defaultValue={host.phone ?? ""}          placeholder="Phone number"  className={input} />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="submit" disabled={isPending}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 gap-4 ${host.active === 0 ? "opacity-40" : ""}`}>
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-gray-900">{host.name}</p>
        {host.title && <p className="text-xs text-gray-500">{host.title}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {host.email
            ? <a href={`mailto:${host.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <EmailIcon /> {host.email}
              </a>
            : <span className="text-xs text-amber-600 flex items-center gap-1">
                <EmailIcon /> No email — notifications disabled
              </span>}
          {host.phone && (
            <a href={`tel:${host.phone}`} className="text-xs text-gray-500 hover:underline flex items-center gap-1">
              <PhoneIcon /> {host.phone}
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={handleToggle} disabled={isPending}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            host.active
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          {host.active ? "Active" : "Inactive"}
        </button>
        <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">Edit</button>
        <button onClick={handleDelete} disabled={isPending} className="text-xs text-red-500 hover:underline">Delete</button>
      </div>
    </div>
  );
}

const input = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20";

function EmailIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
