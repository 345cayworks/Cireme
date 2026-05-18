"use client";

import { useState, useTransition } from "react";

import { generateActivationLinkAction } from "./actions";

export default function ActivationLink({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = () =>
    start(async () => {
      setError(null);
      setCopied(false);
      const res = await generateActivationLinkAction(userId);
      if ("error" in res) {
        setError(res.error);
        setLink(null);
      } else {
        setLink(res.link);
        setExpiresAt(res.expiresAt);
      }
    });

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <button type="button" onClick={generate} disabled={pending}>
        {pending
          ? "Generating…"
          : link
            ? "Regenerate activation link"
            : "Generate activation link"}
      </button>

      {error ? (
        <p role="alert" style={{ color: "var(--danger, #b00)", margin: "0.5rem 0 0" }}>
          {error}
        </p>
      ) : null}

      {link ? (
        <div style={{ marginTop: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              style={{ flex: 1, margin: 0, fontFamily: "monospace" }}
            />
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(link);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="muted" style={{ fontSize: "0.8rem", margin: "0.35rem 0 0" }}>
            Single-use. Send to the applicant out-of-band. Expires{" "}
            {expiresAt ? new Date(expiresAt).toLocaleString() : "soon"}.
            Generating again invalidates the previous link.
          </p>
        </div>
      ) : null}
    </div>
  );
}
