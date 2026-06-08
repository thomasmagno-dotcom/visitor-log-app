"use client";

import { useRef, useState, useTransition } from "react";
import { signIn } from "./actions";
import PolicyAcknowledgment from "./PolicyAcknowledgment";
import CameraCapture from "./CameraCapture";
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
  const [error, setError] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedHost, setSelectedHost] = useState("");
  const [gmpAcked, setGmpAcked] = useState(false);
  const [cdAcked, setCdAcked] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ visitorName: string; host: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const showCustom = selectedPurpose === "Other (specify below)";
  const showCustomHost = selectedHost === "__other__";
  const allAcknowledged = gmpAcked && cdAcked;
  const success = successInfo !== null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const visitorName = (formData.get("name") as string).trim();
    if (showCustom) {
      const custom = (formData.get("purpose_custom") as string).trim();
      formData.set("purpose", custom || "Other");
    } else {
      formData.set("purpose", selectedPurpose);
    }
    formData.delete("purpose_custom");
    let resolvedHost: string;
    if (showCustomHost) {
      resolvedHost = (formData.get("host_custom") as string).trim() || "Other";
      formData.set("host", resolvedHost);
    } else {
      resolvedHost = selectedHost;
      formData.set("host", resolvedHost);
    }
    formData.delete("host_custom");
    if (photo) formData.set("photo", photo);
    setError(null);
    startTransition(async () => {
      try {
        await signIn(formData);
        formRef.current?.reset();
        setSelectedPurpose("");
        setSelectedHost("");
        setGmpAcked(false);
        setCdAcked(false);
        setPhoto(null);
        setSuccessInfo({ visitorName, host: resolvedHost });
        setTimeout(() => setSuccessInfo(null), 8000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Visitor photo — required */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Visitor Photo <span className="text-red-500">*</span>
        </label>
        <CameraCapture
          captured={photo}
          onCapture={setPhoto}
          onClear={() => setPhoto(null)}
        />
      </div>

      <Field label="Visitor Name" name="name" placeholder="Jane Smith" required />
      <Field label="Company" name="company" placeholder="Acme Corp" required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email Address" name="email" type="email" placeholder="jane@example.com" required />
        <Field label="Phone Number" name="phone" type="tel" placeholder="+1 (604) 555-0100" required />
      </div>

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

      {!photo && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          A visitor photo is required before signing in.
        </p>
      )}
      {photo && !allAcknowledged && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          You must read and acknowledge both policies before signing in.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {success && successInfo && (
        <div className="rounded-xl border border-green-300 bg-green-50 px-5 py-4 flex gap-3 items-start">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">
              Welcome, {successInfo.visitorName}! You have been successfully signed in.
            </p>
            <p className="mt-0.5 text-sm text-green-700">
              <strong>{successInfo.host}</strong> has been notified of your arrival. Please wait in the reception area.
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !photo || !allAcknowledged}
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
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
      />
    </div>
  );
}
