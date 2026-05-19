/**
 * Cooperation directory reads (U3). Read-only. Returns marketable inventory
 * across ALL agents/offices for authenticated MLS members, with agent/office
 * attribution + contact. No scope filtering (unlike broker-service), but
 * limited to publicly-visible statuses so other agents' unfinished drafts
 * are never exposed. No compensation data exists or is computed.
 */
import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { listings, offices, users } from "@/db/schema";
import {
  toMemberListing,
  type MemberListing,
} from "@/lib/member-safe";

// Mirrors public-safe's PUBLIC_VISIBLE_STATUSES: cooperation surfaces the
// same marketable set, just with member-only depth + attribution.
const VISIBLE = ["active", "pending", "sold"] as const;

export async function listCooperationListings(): Promise<MemberListing[]> {
  const rows = await db
    .select({
      listing: listings,
      agentName: users.displayName,
      agentEmail: users.email,
      officeName: offices.name,
      officeContactEmail: offices.complianceContactEmail,
    })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.agentId))
    .leftJoin(offices, eq(offices.id, users.officeId))
    .where(inArray(listings.status, [...VISIBLE]))
    .orderBy(desc(listings.updatedAt))
    .limit(500);

  return rows.map((r) =>
    toMemberListing(r.listing, {
      agentName: r.agentName ?? null,
      agentEmail: r.agentEmail ?? null,
      officeName: r.officeName ?? null,
      officeContactEmail: r.officeContactEmail ?? null,
    }),
  );
}
