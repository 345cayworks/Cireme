import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";

async function authenticate(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/mls/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/mls/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main style={{ maxWidth: 420 }}>
      <h1>MLS Core sign in</h1>
      <p className="muted">Brokers, agents, and administrators only.</p>
      <form action={authenticate} className="card">
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" required />
        </label>
        {error ? (
          <p style={{ color: "#ff7a7a" }}>Invalid credentials.</p>
        ) : null}
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
