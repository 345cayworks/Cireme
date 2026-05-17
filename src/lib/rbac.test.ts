import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ROLES,
  can,
  isMlsRole,
  type Permission,
  type Role,
} from "./rbac.ts";

const PERMISSIONS: Permission[] = [
  "listing:create",
  "listing:edit:own",
  "listing:edit:office",
  "listing:moderate",
  "compliance:review",
  "member:approve",
  "platform:admin",
];

// Authoritative expected grants (mirrors governance/Roles_and_Permissions
// _Matrix.md). Every role x permission pair is asserted below, so every
// denial is an explicit negative test.
const EXPECTED: Record<Role, Permission[]> = {
  super_admin: [...PERMISSIONS],
  mls_admin: ["listing:moderate", "compliance:review", "member:approve"],
  broker: ["listing:create", "listing:edit:own", "listing:edit:office"],
  office_manager: ["listing:edit:office"],
  agent: ["listing:create", "listing:edit:own"],
  advertiser: [],
  public_user: [],
};

test("permission matrix: every role x permission (positive + negative)", () => {
  for (const role of ROLES) {
    for (const permission of PERMISSIONS) {
      const expected = EXPECTED[role].includes(permission);
      assert.equal(
        can(role, permission),
        expected,
        `${role} ${expected ? "should" : "must NOT"} have ${permission}`,
      );
    }
  }
});

test("no role is silently granted an unlisted permission", () => {
  for (const role of ROLES) {
    const granted = PERMISSIONS.filter((p) => can(role, p));
    assert.deepEqual(
      granted.sort(),
      [...EXPECTED[role]].sort(),
      `${role} grant set drifted from the signed matrix`,
    );
  }
});

test("undefined/absent role is denied everything", () => {
  for (const permission of PERMISSIONS) {
    assert.equal(can(undefined, permission), false);
  }
});

test("isMlsRole admits only MLS-core roles", () => {
  const mls: Role[] = [
    "super_admin",
    "mls_admin",
    "broker",
    "office_manager",
    "agent",
  ];
  for (const role of ROLES) {
    assert.equal(isMlsRole(role), mls.includes(role), `isMlsRole(${role})`);
  }
  assert.equal(isMlsRole(undefined), false);
});
