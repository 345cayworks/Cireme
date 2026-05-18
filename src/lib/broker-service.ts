/**
 * Broker-scoped read helpers (U1). Read-only: no mutations, no new state.
 *
 * Scope model (from the schema's existing relations):
 *  - roster   = users whose `brokerId` is this broker, OR who share this
 *               user's `officeId` (covers the office_manager case).
 *  - group    = listings authored by anyone in the roster, OR carrying this
 *               user's `officeId`.
 *
 * NOTE: no production flow sets `users.brokerId`/`users.officeId` yet, so for
 * real data these scopes are empty until an admin assignment flow exists.
 * That assignment is an engineering dependency, not part of U1 — surfaces are
 * correct and honest about the empty state rather than faking membership.
 */
import { eq, inArray, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { listings, offices, users } from "@/db/schema";
import type { CurrentUser } from "@/lib/current-user";

export type RosterMember = {
  id: string;
  displayName: string;
  email: string;
  role: typeof users.$inferSelect.role;
  status: typeof users.$inferSelect.status;
};

export async function listRoster(me: CurrentUser): Promise<RosterMember[]> {
  const clauses: SQL[] = [eq(users.brokerId, me.id)];
  if (me.officeId) clauses.push(eq(users.officeId, me.officeId));

  return db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(or(...clauses)!)
    .orderBy(users.displayName)
    .limit(500);
}

export async function listGroupListings(me: CurrentUser) {
  const roster = await listRoster(me);
  const rosterIds = roster.map((r) => r.id);

  const scope: SQL[] = [];
  if (rosterIds.length) scope.push(inArray(listings.agentId, rosterIds));
  if (me.officeId) scope.push(eq(listings.officeId, me.officeId));
  if (scope.length === 0) return [];

  return db
    .select({
      id: listings.id,
      ref: listings.publicReference,
      title: listings.title,
      district: listings.district,
      status: listings.status,
      price: listings.priceKyd,
      agentId: listings.agentId,
      updatedAt: listings.updatedAt,
    })
    .from(listings)
    .where(or(...scope)!)
    .orderBy(listings.updatedAt)
    .limit(500);
}

export async function getBrokerageOffice(me: CurrentUser) {
  if (!me.officeId) return null;
  const [row] = await db
    .select()
    .from(offices)
    .where(eq(offices.id, me.officeId))
    .limit(1);
  return row ?? null;
}
