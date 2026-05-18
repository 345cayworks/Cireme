"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { submitApplicationAction, type ApplyState } from "./actions";

const TYPES = [
  {
    value: "private_seller",
    label: "Private seller",
    blurb: "List a property you own, on your terms.",
  },
  {
    value: "independent_broker",
    label: "Independent broker",
    blurb: "Manage listings for your clients without lock-in.",
  },
  {
    value: "advertiser",
    label: "Advertiser / partner",
    blurb: "Reach Cayman property buyers and sellers.",
  },
] as const;

const STEPS = ["Type", "Details", "Review"] as const;

export default function ApplyForm() {
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(
    submitApplicationAction,
    { status: "idle" },
  );

  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [message, setMessage] = useState("");

  if (state.status === "ok") {
    return (
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <p className="eyebrow">Application received</p>
        <h2 style={{ marginTop: 0 }}>Thank you — you’ll be contacted.</h2>
        <p className="muted">
          Your application has been recorded. A CIREME administrator will
          review it and follow up by email. No account is created until your
          application is approved.
        </p>
        <Link href="/" className="btn" style={{ marginTop: "0.5rem" }}>
          Back to home
        </Link>
      </div>
    );
  }

  const typeLabel = TYPES.find((t) => t.value === type)?.label ?? "—";
  const canNext =
    step === 0
      ? type !== ""
      : step === 1
        ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && name.trim().length >= 2
        : true;

  return (
    <div style={{ marginTop: "1.5rem", maxWidth: 560 }}>
      <ol
        style={{
          display: "flex",
          gap: "0.5rem",
          listStyle: "none",
          padding: 0,
          margin: "0 0 1rem",
          fontSize: "0.8rem",
        }}
      >
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step ? "step" : undefined}
            className="badge"
            style={
              i === step
                ? { background: "var(--gold-soft)", color: "#7a5e16" }
                : undefined
            }
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <form action={formAction} className="card">
        {/* Honeypot — off-screen, not announced; only bots fill it. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </label>
        </div>

        {/* All inputs stay mounted so the final submit carries every field. */}
        <div hidden={step !== 0}>
          <h2 style={{ marginTop: 0 }}>What are you applying as?</h2>
          {TYPES.map((t) => (
            <label
              key={t.value}
              style={{
                display: "flex",
                gap: "0.6rem",
                alignItems: "flex-start",
                border: "1px solid var(--n-200)",
                borderRadius: "var(--r-sm)",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                cursor: "pointer",
                fontWeight: 400,
              }}
            >
              <input
                type="radio"
                name="requestedType"
                value={t.value}
                checked={type === t.value}
                onChange={(e) => setType(e.target.value)}
                style={{ width: "auto", margin: "0.2rem 0 0" }}
                required
              />
              <span>
                <strong>{t.label}</strong>
                <span
                  className="muted"
                  style={{ display: "block", fontSize: "0.85rem" }}
                >
                  {t.blurb}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div hidden={step !== 1}>
          <h2 style={{ marginTop: 0 }}>Your details</h2>
          <label>
            Email
            <input
              type="email"
              name="applicantEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Full name
            <input
              type="text"
              name="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </label>
          <label>
            Firm / brokerage <span className="muted">(optional)</span>
            <input
              type="text"
              name="firm"
              value={firm}
              onChange={(e) => setFirm(e.target.value)}
            />
          </label>
          <label>
            Message <span className="muted">(optional)</span>
            <textarea
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
        </div>

        <div hidden={step !== 2}>
          <h2 style={{ marginTop: 0 }}>Review</h2>
          <dl style={{ margin: 0 }}>
            {[
              ["Applying as", typeLabel],
              ["Email", email],
              ["Name", name],
              ["Firm", firm || "—"],
              ["Message", message || "—"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.4rem 0",
                  borderBottom: "1px solid var(--n-100)",
                }}
              >
                <dt className="muted" style={{ fontSize: "0.85rem" }}>
                  {k}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    textAlign: "right",
                    maxWidth: "60%",
                    overflowWrap: "anywhere",
                  }}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <p className="disclaimer" style={{ marginTop: "1rem" }}>
            Submitting records an application only. No account is created until
            an administrator approves it.
          </p>
        </div>

        {state.status === "error" ? (
          <p
            role="alert"
            style={{ color: "var(--error)", marginTop: "0.75rem" }}
          >
            {state.message}
          </p>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <button
            type="button"
            className="btn-outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || pending}
          >
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
            >
              Next
            </button>
          ) : (
            <button type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Submit application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
