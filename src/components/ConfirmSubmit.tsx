"use client";

import { useState } from "react";

/**
 * Deliberate, non-optimistic confirmation for destructive admin actions
 * (Phase 2 safety rule). When `typedPhrase` is set the operator must type it
 * verbatim to enable the action (used for terminate / remove).
 */
export default function ConfirmSubmit({
  label,
  prompt,
  typedPhrase,
}: {
  label: string;
  prompt: string;
  typedPhrase?: string;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        className="btn-outline"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
    );
  }

  const ready = !typedPhrase || typed === typedPhrase;

  return (
    <span
      style={{
        display: "inline-flex",
        gap: "0.5rem",
        alignItems: "center",
        flexWrap: "wrap",
        background: "var(--error-soft)",
        padding: "0.5rem 0.75rem",
        borderRadius: "var(--r-sm)",
      }}
    >
      <span style={{ fontSize: "0.85rem", color: "var(--error)" }}>
        {prompt}
      </span>
      {typedPhrase ? (
        <input
          aria-label={`Type ${typedPhrase} to confirm`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={typedPhrase}
          style={{ margin: 0, width: 140 }}
        />
      ) : null}
      <button type="submit" disabled={!ready}>
        Confirm {label}
      </button>
      <button
        type="button"
        className="btn-outline"
        onClick={() => {
          setOpen(false);
          setTyped("");
        }}
      >
        Cancel
      </button>
    </span>
  );
}
