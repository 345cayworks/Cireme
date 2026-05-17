"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function FormBody({ hasError }: { hasError: boolean }) {
  const { pending } = useFormStatus();
  const [show, setShow] = useState(false);

  return (
    <>
      <label style={{ display: "block", marginBottom: "1rem" }}>
        <span style={{ display: "block", marginBottom: "0.35rem" }}>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          autoFocus
          disabled={pending}
          style={{ width: "100%", minHeight: 44 }}
          aria-describedby={hasError ? "login-error" : undefined}
        />
      </label>

      <label style={{ display: "block" }}>
        <span style={{ display: "block", marginBottom: "0.35rem" }}>
          Password
        </span>
        <span style={{ position: "relative", display: "block" }}>
          <input
            type={show ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            disabled={pending}
            style={{ width: "100%", minHeight: 44, paddingRight: "3.75rem" }}
            aria-describedby={hasError ? "login-error" : undefined}
          />
          <button
            type="button"
            className="btn-outline"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              minHeight: 32,
              padding: "0 0.6rem",
              fontSize: "0.8rem",
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      {hasError ? (
        <p
          id="login-error"
          role="alert"
          style={{ color: "#b4231f", marginTop: "1rem", marginBottom: 0 }}
        >
          Email or password is incorrect, or the account isn’t active yet.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        style={{ width: "100%", minHeight: 44, marginTop: "1rem" }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </>
  );
}

export default function LoginForm({
  action,
  hasError,
}: {
  action: (formData: FormData) => void;
  hasError: boolean;
}) {
  return (
    <form action={action} className="card" style={{ marginTop: "1.5rem" }}>
      <FormBody hasError={hasError} />
    </form>
  );
}
