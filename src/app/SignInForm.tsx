"use client";

import { useRef, useState, useTransition } from "react";
import { signIn } from "./actions";
import PolicyAcknowledgment from "./PolicyAcknowledgment";
import { GMP_POLICY, COMMUNICABLE_DISEASE_POLICY } from "@/lib/policies";

const VISIT_PURPOSES = [
  "Audit / Inspection (Government or Regulatory)",
  "Third-Party Food Safety Audit (SQF, BRC, FSSC 22000, etc.)",
  "Supplier / Vendor Visit",
  "Raw Material Delivery",
  "Equipment Delivery or Installation",
  "Equipment Maintenance or Repair",
  "Pest Control Service",
  "Sanitation / Cleaning Service",
  "Customer / Buyer Tour",
  "Sales or Business Meeting",
  "Quality Assurance / Lab Visit",
  "Training or Educational Visit",
  "Job Interview or HR Visit",
  "Contractor or Construction Work",
  "IT / Technology Support",
  "Other (specify below)",
];

type Host = { id: number; name: string; title: string | null };

export default function SignInForm({ hosts }: { hosts: Host[] }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedHost, setSelectedHost] = useState("");
  const [gmpAcked, setGmpAcked] = useState(false);
  const [cdAcked, setCdAcked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const showCustom = selectedPurpose === "Other (specify below)";
  const showCustomHost = selectedHost === "__other__";
  const allAcknowledged = gmpAcked && cdAcked;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (showCustom) {
      const custom = (formData.get("purpose_custom") as string).trim();
      formData.set("purpose", custom || "Other");
    } else {
      formData.set("purpose", selectedPurpose);
    }
    formData.delete("purpose_custom");
    if (showCustomHost) {
      const customHost = (formData.get("host_custom") as string).trim();
      formData.set("host", customHost || "Other");
    } else {
      formData.set("host", selectedHost);
    }
    formData.delete("host_custom");
    setError(null);
    startTransition(async () => {
      try {
        await signIn(formData);
        formRef.current?.reset();
        setSelectedPurpose("");
        setSelectedHost("");
        setGmpAcked(false);
        setCdAcked(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <Field label="Visitor Name" name="name" placeholder="Jane Smith" required />
      <Field label="Company" name="company" placeholder="Acme Corp" required />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="purpose" className="text-sm font-medium text-gray-700">
          Purpose of Visit
        </label>
        <select
          id="purpose"
          name="purpose_select"
          required
          value={selectedPurpose}
          onChange={(e) => setSelectedPurpose(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 bg-white"
        >
          <option value="" disabled>Select a purpose…</option>
          {VISIT_PURPOSES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {showCustom && (
          <input
            id="purpose_custom"
            name="purpose_custom"
            type="text"
            placeholder="Describe your purpose…"
            required
            className="mt-1 rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="host" className="text-sm font-medium text-gray-700">
          Host
        </label>
        {hosts.length > 0 ? (
          <>
            <select
              id="host"
              name="host_select"
              required
              value={selectedHost}
              onChange={(e) => setSelectedHost(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 bg-white"
            >
              <option value="" disabled>Select a host…</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name}{h.title ? ` — ${h.title}` : ""}
                </option>
              ))}
              <option value="__other__">Other (specify below)</option>
            </select>
            {showCustomHost && (
              <input
                name="host_custom"
                type="text"
                placeholder="Enter host name…"
                required
                className="mt-1 rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
              />
            )}
          </>
        ) : (
          <input
            name="host_custom"
            type="text"
            placeholder="Who are you visiting?"
            required
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
        )}
      </div>

      {/* Policy acknowledgments */}
      <div className="border-t border-gray-100 pt-5 space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Required Policies — Please read and acknowledge each one
        </p>
        <PolicyAcknowledgment
          policy={GMP_POLICY}
          index={0}
          checked={gmpAcked}
          onChange={setGmpAcked}
        />
        <PolicyAcknowledgment
          policy={COMMUNICABLE_DISEASE_POLICY}
          index={1}
          checked={cdAcked}
          onChange={setCdAcked}
        />
      </div>

      {!allAcknowledged && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          You must read and acknowledge both policies before signing in.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          Welcome! You have been signed in successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !allAcknowledged}
        className="w-full rounded-lg bg-green-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
      />
    </div>
  );
}
