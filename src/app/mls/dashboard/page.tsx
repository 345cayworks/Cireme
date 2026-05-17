import { signOut } from "@/auth";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main>
      <h1>MLS Core</h1>
      <div className="card">
        <p>
          Signed in as <strong>{session?.user?.email}</strong>
        </p>
        <p className="muted">
          Role: {session?.user?.role} · Status: {session?.user?.status}
        </p>
      </div>
      <p className="muted" style={{ marginTop: "1.5rem" }}>
        Operational modules (listing input, compliance, membership) arrive in
        Phases 4–5.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        style={{ marginTop: "1.5rem" }}
      >
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
