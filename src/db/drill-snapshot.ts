/**
 * Backup/restore drill helper (U7). READ-ONLY: issues only `count(*)`
 * SELECTs — it never writes, migrates, or mutates. It does NOT perform a
 * backup or a restore; it makes the human-run drill in
 * `governance/Backup_Restore_Drill.md` executable and machine-verifiable.
 *
 *   npm run db:drill-snapshot -- snapshot [outfile]
 *   npm run db:drill-snapshot -- verify <snapshot-file>
 *
 * `snapshot` (run BEFORE the restore, against the source) records row
 * counts. `verify` (run AFTER pointing a deploy at the restored DB)
 * re-counts and compares:
 *   - any table below snapshot − RPO tolerance  → FAIL (data loss)
 *   - auditLog count strictly below snapshot     → FAIL (append-only
 *     integrity violated; the log must never lose rows)
 * Exit code is non-zero on FAIL so it can gate a drill script.
 */
import { writeFileSync, readFileSync } from "node:fs";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  auditLog,
  complianceActions,
  complianceIssues,
  listingMedia,
  listings,
  memberships,
  users,
} from "@/db/schema";

const TABLES = {
  users,
  applications,
  memberships,
  listings,
  listingMedia,
  complianceIssues,
  complianceActions,
  auditLog,
} as const;

type Counts = Record<keyof typeof TABLES, number>;

// Rows allowed to be missing post-restore (point-in-time gap), per the
// RPO target in Backup_Restore_Drill.md. auditLog is exempt: it is
// append-only and must never lose rows regardless of RPO.
const RPO_ROW_TOLERANCE = Number(process.env.DRILL_RPO_TOLERANCE ?? "0");

async function countRows(): Promise<Counts> {
  const out = {} as Counts;
  for (const [name, table] of Object.entries(TABLES)) {
    const [row] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(table);
    out[name as keyof typeof TABLES] = row?.c ?? 0;
  }
  return out;
}

async function main() {
  const [mode, file] = process.argv.slice(2);

  if (mode === "snapshot") {
    const counts = await countRows();
    const payload = JSON.stringify(
      { takenAt: new Date().toISOString(), counts },
      null,
      2,
    );
    const out =
      file ?? `governance/drill-snapshot-${Date.now()}.json`;
    writeFileSync(out, payload + "\n");
    console.log(`Snapshot written: ${out}`);
    console.table(counts);
    return;
  }

  if (mode === "verify") {
    if (!file) throw new Error("verify requires a snapshot file path");
    const prev = JSON.parse(readFileSync(file, "utf8")) as {
      takenAt: string;
      counts: Counts;
    };
    const now = await countRows();
    let failed = false;
    const report: Record<string, string> = {};
    for (const name of Object.keys(TABLES) as (keyof typeof TABLES)[]) {
      const before = prev.counts[name] ?? 0;
      const after = now[name] ?? 0;
      const isAudit = name === "auditLog";
      const floor = isAudit ? before : before - RPO_ROW_TOLERANCE;
      const ok = after >= floor;
      if (!ok) failed = true;
      report[name] = `${before} → ${after} ${
        ok ? "ok" : isAudit ? "FAIL (audit log lost rows)" : "FAIL (>RPO loss)"
      }`;
    }
    console.log(`Snapshot taken ${prev.takenAt}`);
    console.table(report);
    if (failed) {
      console.error(
        "DRILL VERIFY: FAIL — restored data did not meet RPO / audit integrity.",
      );
      process.exit(1);
    }
    console.log("DRILL VERIFY: PASS — counts within RPO; audit log intact.");
    return;
  }

  throw new Error(
    "usage: db:drill-snapshot -- snapshot [outfile] | verify <file>",
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
