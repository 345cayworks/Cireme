import { inArray } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { isPubliclyVisible, toPublicListing } from "@/lib/public-safe";
import { buildResoFeed, canAccessResoFeed } from "@/lib/reso-export";

export const dynamic = "force-dynamic";

/**
 * One-way RESO-aligned listing feed. Member-only (any MLS role); read-only.
 * JSON 401/403 (never a redirect — this is an API, not a page).
 */
export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user.status !== "active") {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!canAccessResoFeed(user.role)) {
    return Response.json(
      { error: "RESO feed is restricted to MLS members" },
      { status: 403 },
    );
  }

  const rows = await db
    .select()
    .from(listings)
    .where(inArray(listings.status, ["active", "pending", "sold"]))
    .limit(1000);

  const feed = buildResoFeed(rows.filter(isPubliclyVisible).map(toPublicListing));
  return Response.json(feed, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
