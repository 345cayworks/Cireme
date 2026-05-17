/**
 * CIREME data model — Phase 1-3 foundation.
 *
 * Design constraints carried from the roadmap addendums:
 *  - Cayman-correct: Block & Parcel is the canonical property key; district is
 *    a fixed enum; tenure is first-class; money is KYD.
 *  - No compensation/cooperation fields anywhere (locked Phase 0 positioning).
 *  - Public/private classification is structural: see src/lib/public-safe.ts.
 *  - History and audit are append-only tables, not in-place mutation.
 */
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "super_admin",
  "mls_admin",
  "broker",
  "office_manager",
  "agent",
  "advertiser",
  "public_user",
]);

export const accountStatus = pgEnum("account_status", [
  "pending",
  "active",
  "suspended",
  "inactive",
]);

export const membershipType = pgEnum("membership_type", [
  "private_seller",
  "independent_broker",
  "advertiser",
]);

export const applicationStatus = pgEnum("application_status", [
  "submitted",
  "under_review",
  "approved",
  "denied",
  "withdrawn",
]);

export const listingStatus = pgEnum("listing_status", [
  "draft",
  "incomplete",
  "active",
  "pending",
  "sold",
  "withdrawn",
  "expired",
  "canceled",
  "off_market",
]);

export const caymanDistrict = pgEnum("cayman_district", [
  "george_town",
  "west_bay",
  "bodden_town",
  "north_side",
  "east_end",
  "cayman_brac",
  "little_cayman",
]);

export const tenureType = pgEnum("tenure_type", [
  "freehold",
  "strata",
  "leasehold",
]);

export const propertyType = pgEnum("property_type", [
  "residential",
  "condo",
  "land",
  "commercial",
  "multi_family",
]);

export const complianceIssueType = pgEnum("compliance_issue_type", [
  "missing_required_fields",
  "stale_listing",
  "duplicate",
  "misleading_media",
  "incorrect_classification",
  "sold_left_active",
]);

export const complianceIssueStatus = pgEnum("compliance_issue_status", [
  "open",
  "resolved",
  "dismissed",
]);

export const complianceActionType = pgEnum("compliance_action_type", [
  "flagged",
  "correction_requested",
  "unpublished",
  "removed",
  "account_suspended",
  "account_terminated",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const offices = pgTable("offices", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  brandingBlobKey: text("branding_blob_key"),
  complianceContactEmail: text("compliance_contact_email"),
  ...timestamps,
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: userRole("role").notNull().default("public_user"),
  status: accountStatus("status").notNull().default("pending"),
  // Self-relation: agents belong to a managing broker (a users row).
  brokerId: uuid("broker_id"),
  officeId: uuid("office_id").references(() => offices.id),
  ...timestamps,
});

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: membershipType("type").notNull(),
  status: accountStatus("status").notNull().default("pending"),
  officeId: uuid("office_id").references(() => offices.id),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  ...timestamps,
});

export const membershipStatusHistory = pgTable("membership_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  membershipId: uuid("membership_id")
    .notNull()
    .references(() => memberships.id),
  fromStatus: accountStatus("from_status"),
  toStatus: accountStatus("to_status").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicantEmail: text("applicant_email").notNull(),
  requestedType: membershipType("requested_type").notNull(),
  status: applicationStatus("status").notNull().default("submitted"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  ...timestamps,
});

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Stable human-facing reference, distinct from the surrogate UUID.
  publicReference: text("public_reference").notNull().unique(),
  title: text("title").notNull(),
  propertyType: propertyType("property_type").notNull(),
  status: listingStatus("status").notNull().default("draft"),
  district: caymanDistrict("district").notNull(),
  tenure: tenureType("tenure").notNull(),
  // Cayman canonical property key (Registered Land Act / Lands & Survey).
  landBlock: text("land_block"),
  landParcel: text("land_parcel"),
  priceKyd: numeric("price_kyd", { precision: 14, scale: 2 }),
  soldPriceKyd: numeric("sold_price_kyd", { precision: 14, scale: 2 }),
  bedrooms: integer("bedrooms"),
  bathrooms: numeric("bathrooms", { precision: 4, scale: 1 }),
  areaSqFt: integer("area_sq_ft"),
  // PUBLIC field.
  publicDescription: text("public_description"),
  // PRIVATE field — never enters the public projection (public-safe.ts).
  privateRemarks: text("private_remarks"),
  agentId: uuid("agent_id").references(() => users.id),
  officeId: uuid("office_id").references(() => offices.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const listingMedia = pgTable("listing_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  // Netlify Blobs key: listings/{listingId}/{timestamp}-{filename}
  blobKey: text("blob_key").notNull(),
  position: integer("position").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const listingStatusHistory = pgTable("listing_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  fromStatus: listingStatus("from_status"),
  toStatus: listingStatus("to_status").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const listingPriceHistory = pgTable("listing_price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  oldPriceKyd: numeric("old_price_kyd", { precision: 14, scale: 2 }),
  newPriceKyd: numeric("new_price_kyd", { precision: 14, scale: 2 }),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const complianceIssues = pgTable("compliance_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").references(() => listings.id),
  type: complianceIssueType("type").notNull(),
  detail: text("detail"),
  status: complianceIssueStatus("status").notNull().default("open"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const complianceActions = pgTable("compliance_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => complianceIssues.id),
  actionType: complianceActionType("action_type").notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Append-only audit trail. Rows are never updated or deleted. */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id),
  entity: text("entity").notNull(),
  entityId: uuid("entity_id"),
  action: text("action").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
