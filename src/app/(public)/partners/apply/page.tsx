import Link from "next/link";

import ApplyForm from "./ApplyForm";

export const metadata = { title: "Apply — CIREME Partners" };

export default function PartnerApplyPage() {
  return (
    <main>
      <p className="muted" style={{ marginBottom: "0.5rem" }}>
        <Link href="/partners">← Partners</Link>
      </p>
      <p className="eyebrow">Join CIREME</p>
      <h1>Partner application</h1>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Tell us how you’d like to take part. It takes a minute — no account is
        created until an administrator approves your application.
      </p>
      <ApplyForm />
    </main>
  );
}
