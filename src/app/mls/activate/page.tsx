import Link from "next/link";

import { setPasswordAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <main style={{ maxWidth: 420, margin: "4rem auto" }}>
        <div className="card">
          <h1>Activate your account</h1>
          <p className="muted">
            This activation link is missing or invalid. Ask an administrator
            to send you a new one.
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link href="/mls/login">← Back to sign in</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto" }}>
      <div className="card">
        <p className="eyebrow">CIREME</p>
        <h1 style={{ marginTop: 0 }}>Set your password</h1>
        <p className="muted">
          Your application was approved. Choose a password to activate your
          account.
        </p>

        {error ? (
          <p role="alert" style={{ color: "var(--danger, #b00)" }}>
            {error}
          </p>
        ) : null}

        <form
          action={setPasswordAction}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <input type="hidden" name="token" value={token} />
          <label>
            New password
            <input
              type="password"
              name="password"
              required
              minLength={10}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              name="confirm"
              required
              minLength={10}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" style={{ marginTop: "0.5rem" }}>
            Activate account
          </button>
        </form>
      </div>
    </main>
  );
}
