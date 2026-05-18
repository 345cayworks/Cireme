import Link from "next/link";

import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import { getBrokerageOffice } from "@/lib/broker-service";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function BrokeragePage() {
  try {
    await requirePermission("listing:edit:office");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>Brokerage</h1>
          <div className="card">
            <p>Your role does not have a brokerage profile.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Dashboard</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const me = await getCurrentUser();
  const office = me ? await getBrokerageOffice(me) : null;

  return (
    <main>
      <p className="eyebrow">Brokerage</p>
      <h1 style={{ marginTop: 0 }}>Brokerage profile</h1>
      <p className="muted">
        Read-only. Office details are managed by an administrator — there is
        no office-editing action in this build.
      </p>

      {!office ? (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p style={{ marginTop: 0 }}>
            You are not linked to an office yet.
          </p>
          <p className="muted" style={{ marginBottom: 0 }}>
            An administrator assigns your account to an office; it will then
            appear here.
          </p>
        </div>
      ) : (
        <div
          className="card"
          style={{
            marginTop: "1rem",
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {[
            ["Name", office.name],
            ["Slug", office.slug],
            ["Compliance contact", office.complianceContactEmail ?? "—"],
            ["Branding asset", office.brandingBlobKey ? "Set" : "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <div
                className="muted"
                style={{ fontSize: "0.75rem", textTransform: "uppercase" }}
              >
                {label}
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
