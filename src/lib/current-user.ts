/**
 * Full signed-in user record. The Auth.js session only carries id/email/
 * role/status; broker/office scoping needs `brokerId`/`officeId`, which live
 * on the `users` row. This is the single place that reads them so pages don't
 * each re-implement the lookup.
 */
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  role: typeof users.$inferSelect.role;
  status: typeof users.$inferSelect.status;
  brokerId: string | null;
  officeId: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      status: users.status,
      brokerId: users.brokerId,
      officeId: users.officeId,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return row ?? null;
}
