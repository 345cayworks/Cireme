import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ACCOUNT_TYPES,
  AccountTransitionError,
  ApplicationTransitionError,
  allowedAccountTransitions,
  allowedApplicationTransitions,
  canTransitionAccount,
  canTransitionApplication,
  type AccountStatus,
  type ApplicationStatus,
} from "./account-lifecycle.ts";

const ACCOUNT_STATUSES: AccountStatus[] = [
  "pending",
  "active",
  "suspended",
  "inactive",
];
const APPLICATION_STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "denied",
  "withdrawn",
];

const EXPECTED_ACCOUNT: Record<AccountStatus, AccountStatus[]> = {
  pending: ["active", "inactive"],
  active: ["suspended", "inactive"],
  suspended: ["active", "inactive"],
  inactive: [],
};

const EXPECTED_APPLICATION: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ["under_review", "withdrawn"],
  under_review: ["approved", "denied", "withdrawn"],
  approved: [],
  denied: [],
  withdrawn: [],
};

test("all three account types are enumerated", () => {
  assert.deepEqual(
    [...ACCOUNT_TYPES].sort(),
    ["advertiser", "independent_broker", "private_seller"],
  );
});

test("account status: every from x to pair (positive + negative)", () => {
  for (const from of ACCOUNT_STATUSES) {
    for (const to of ACCOUNT_STATUSES) {
      const expected = EXPECTED_ACCOUNT[from].includes(to);
      assert.equal(
        canTransitionAccount(from, to),
        expected,
        `account ${from} -> ${to} should be ${expected}`,
      );
    }
    assert.deepEqual(
      [...allowedAccountTransitions(from)].sort(),
      [...EXPECTED_ACCOUNT[from]].sort(),
    );
  }
});

test("application status: every from x to pair (positive + negative)", () => {
  for (const from of APPLICATION_STATUSES) {
    for (const to of APPLICATION_STATUSES) {
      const expected = EXPECTED_APPLICATION[from].includes(to);
      assert.equal(
        canTransitionApplication(from, to),
        expected,
        `application ${from} -> ${to} should be ${expected}`,
      );
    }
    assert.deepEqual(
      [...allowedApplicationTransitions(from)].sort(),
      [...EXPECTED_APPLICATION[from]].sort(),
    );
  }
});

test("terminal statuses allow no transitions", () => {
  assert.deepEqual([...allowedAccountTransitions("inactive")], []);
  for (const terminal of ["approved", "denied", "withdrawn"] as const) {
    assert.deepEqual([...allowedApplicationTransitions(terminal)], []);
  }
});

test("transition errors carry from/to", () => {
  const a = new AccountTransitionError("inactive", "active");
  assert.equal(a.from, "inactive");
  assert.equal(a.to, "active");
  const b = new ApplicationTransitionError("approved", "submitted");
  assert.equal(b.name, "ApplicationTransitionError");
  assert.equal(b.to, "submitted");
});
