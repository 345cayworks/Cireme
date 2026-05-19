"use client";

import { useState } from "react";

import ConfirmSubmit from "@/components/ConfirmSubmit";
import {
  planBulk,
  selectAllEligible,
  toggle,
} from "@/lib/bulk-selection";
import { bulkDismissIssuesAction } from "./actions";

type BulkIssue = {
  id: string;
  type: string;
  listingRef: string | null;
};

// Every issue rendered here is already status=open (page query), so all
// are eligible for bulk dismissal. The predicate is kept explicit so the
// invariant is enforced by the same tested model, not assumed.
const isEligible = () => true;

export default function ComplianceBulkPanel({
  issues,
}: {
  issues: BulkIssue[];
}) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  if (issues.length === 0) return null;

  const plan = planBulk(issues, selected, (i) => i.id, isEligible);
  const count = plan.willApply.length;

  return (
    <div
      className="card"
      style={{ marginBottom: "1.5rem", background: "var(--surface)" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <strong>Bulk: dismiss false positives</strong>
        <span className="muted" style={{ fontSize: "0.85rem" }}>
          {count} selected
          <button
            type="button"
            className="btn-outline"
            style={{ marginLeft: "0.75rem" }}
            onClick={() =>
              setSelected(
                selectAllEligible(issues, (i) => i.id, isEligible),
              )
            }
          >
            Select all ({issues.length})
          </button>
          <button
            type="button"
            className="btn-outline"
            style={{ marginLeft: "0.4rem" }}
            onClick={() => setSelected(new Set())}
          >
            Clear
          </button>
        </span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0" }}>
        {issues.map((issue) => (
          <li key={issue.id} style={{ padding: "0.25rem 0" }}>
            <label style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={selected.has(issue.id)}
                onChange={() => setSelected(toggle(selected, issue.id))}
              />
              <span>
                <strong>{issue.type.replace(/_/g, " ")}</strong>{" "}
                <span className="muted">{issue.listingRef ?? "—"}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <form
        action={bulkDismissIssuesAction}
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          flexWrap: "wrap",
          borderTop: "1px solid var(--n-200)",
          paddingTop: "0.6rem",
        }}
      >
        {plan.willApply.map((id) => (
          <input key={id} type="hidden" name="issueIds" value={id} />
        ))}
        <input
          type="text"
          name="note"
          required
          placeholder="Dismiss reason — applied to all selected (required)"
          style={{ flex: 1, minWidth: 240, margin: 0 }}
        />
        {count === 0 ? (
          <button type="submit" disabled>
            Dismiss selected
          </button>
        ) : (
          <ConfirmSubmit
            label={`Dismiss ${count} selected`}
            prompt={`Dismiss ${count} issue(s) as false positives? Each is individually audited.`}
          />
        )}
      </form>
    </div>
  );
}
