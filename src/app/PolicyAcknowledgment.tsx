"use client";

import { useRef, useState, useEffect } from "react";

type Policy = { title: string; version: string; effectiveDate: string; body: string };

export default function PolicyAcknowledgment({
  policy,
  index,
  checked,
  onChange,
}: {
  policy: Policy;
  index: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function check() {
      if (!el) return;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
      if (atBottom) setScrolledToBottom(true);
    }

    // In case the content is short enough to not need scrolling
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, []);

  const checkboxId = `policy-ack-${index}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">
          {policy.title}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Version {policy.version} &nbsp;·&nbsp; Effective {policy.effectiveDate}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="h-52 overflow-y-scroll rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono"
        >
          {policy.body}
        </div>

        {/* Fade + prompt shown until scrolled to bottom */}
        {!scrolledToBottom && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2 h-16 rounded-b-lg bg-gradient-to-t from-gray-100 to-transparent">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Scroll to read the full policy
            </span>
          </div>
        )}
      </div>

      {/* Checkbox — disabled until scrolled to bottom */}
      <label
        htmlFor={checkboxId}
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
          scrolledToBottom
            ? checked
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-white hover:border-green-400"
            : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
        }`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          disabled={!scrolledToBottom}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-green-700 disabled:cursor-not-allowed"
        />
        <span className="text-sm text-gray-700 leading-snug select-none">
          I have read and understood this policy in full and agree to comply with its
          requirements during my visit to Van Giessen Growers Inc.
        </span>
      </label>
    </div>
  );
}
