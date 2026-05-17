import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { signIn } from "@/auth";
import LoginForm from "./LoginForm";

const ROLES: Record<string, { label: string; title: string }> = {
  admin: { label: "Administrator", title: "Sign in to the Admin workspace" },
  broker: { label: "Broker", title: "Sign in to the Broker workspace" },
  agent: { label: "Agent", title: "Sign in to the Agent workspace" },
};

export const metadata = { title: "Sign in — CIREME" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; as?: string }>;
}) {
  const { error, as } = await searchParams;
  // `as` is a cosmetic hint only — never trusted for authorization.
  const role = as && ROLES[as] ? ROLES[as] : null;

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/mls/dashboard",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        const q = as ? `&as=${encodeURIComponent(as)}` : "";
        redirect(`/mls/login?error=1${q}`);
      }
      throw err;
    }
  }

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <p className="eyebrow">{role ? role.label : "MLS Core"}</p>
        <h1 style={{ marginTop: "0.25rem" }}>
          {role ? role.title : "Sign in"}
        </h1>
        <p className="muted" style={{ marginTop: "-0.25rem" }}>
          For brokers, agents, and administrators. Access is determined by your
          account, not the entry you chose.
        </p>

        <LoginForm action={authenticate} hasError={error === "1"} />

        <details style={{ marginTop: "1.25rem" }}>
          <summary
            style={{
              cursor: "pointer",
              color: "var(--meta)",
              fontSize: "0.9rem",
            }}
          >
            Trouble signing in?
          </summary>
          <p
            className="muted"
            style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}
          >
            There is no self-serve password reset yet. An administrator can
            restore access to your account. If your partner or staff
            application is still pending, you’ll be able to sign in once it’s
            approved.
          </p>
        </details>

        <p className="disclaimer" style={{ marginTop: "1.5rem" }}>
          <Link href="/">← Back to CIREME</Link>
        </p>
      </div>
    </main>
  );
}
