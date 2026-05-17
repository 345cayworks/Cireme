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
      <p style={{ marginTop: "1.5rem" }}>
        <a href="/mls/listings">My listings →</a>
      </p>
      <p>
        <a href="/mls/compliance">Compliance review →</a>
      </p>
      <p>
        <a href="/mls/members">Membership review →</a>
      </p>
      <p className="muted">
        Further operational modules (listing input, membership) follow.
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
