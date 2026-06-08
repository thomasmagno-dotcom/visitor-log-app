"use client";

import { useState, useTransition } from "react";
import { addHost, updateHost, toggleHost, deleteHost } from "./actions";

type Host = { id: number; name: string; title: string | null; active: number };

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
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          name="name"
          type="text"
          placeholder="Full name *"
          required
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
        <input
          name="title"
          type="text"
          placeholder="Job title (optional)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? "Adding…" : "Add Host"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}

function HostList({ hosts }: { hosts: Host[] }) {
  if (hosts.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No hosts yet. Add one above.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
      {hosts.map((host) => (
        <HostRow key={host.id} host={host} />
      ))}
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
    startTransition(async () => {
      await updateHost(formData);
      setEditing(false);
    });
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
      <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-3 p-4 items-center">
        <input
          name="name"
          defaultValue={host.name}
          required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
        <input
          name="title"
          defaultValue={host.title ?? ""}
          placeholder="Job title"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={isPending} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 gap-4 ${host.active === 0 ? "opacity-40" : ""}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{host.name}</p>
        {host.title && <p className="text-xs text-gray-500 truncate">{host.title}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggle}
          disabled={isPending}
          title={host.active ? "Deactivate" : "Activate"}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            host.active
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {host.active ? "Active" : "Inactive"}
        </button>
        <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">
          Edit
        </button>
        <button onClick={handleDelete} disabled={isPending} className="text-xs text-red-500 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}
