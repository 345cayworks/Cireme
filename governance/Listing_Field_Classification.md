# CIREME Listing Field Classification — v1

> Phase 1 gate: **100% of listing fields classified public/private.** This
> document mirrors the single source of truth in
> `src/lib/listing-classification.ts`. Coverage is **machine-enforced**:
> `LISTING_FIELD_CLASSIFICATION satisfies Record<keyof ListingRow, FieldClass>`
> makes an unclassified column a compile error, and
> `listing-classification.test.ts` fails CI if classification, the public
> projection, or the schema drift apart. The gate is therefore objectively
> verifiable, not asserted.

## Classes

- **public** — may appear in the public portal projection.
- **private** — member/owner-only; never leaves the MLS core.
- **internal** — operational metadata; not user-facing, never in public output.

`public-safe.ts` treats both *private* and *internal* as never-public.

## Classification (all 21 listing columns)

| Field | Class | Rationale |
|---|---|---|
| `id` | public | Opaque identifier |
| `publicReference` | public | Human-facing listing reference |
| `title` | public | Marketing copy |
| `propertyType` | public | Search/display facet |
| `status` | public | Public lifecycle (active/pending/sold visible) |
| `district` | public | Cayman district — public location granularity |
| `tenure` | public | Freehold/strata/leasehold |
| `priceKyd` | public | Asking price (KYD) |
| `bedrooms` | public | Listing facet |
| `bathrooms` | public | Listing facet |
| `areaSqFt` | public | Listing facet |
| `publicDescription` | public | Author-intended public text |
| `publishedAt` | public | Publication timestamp |
| `landBlock` | private | Precise parcel key can re-identify owner |
| `landParcel` | private | Precise parcel key can re-identify owner |
| `soldPriceKyd` | private | Sale economics — member-only |
| `privateRemarks` | private | Internal/agent notes |
| `agentId` | private | Personal data linkage (DPA) |
| `officeId` | internal | Org metadata |
| `createdAt` | internal | Operational metadata |
| `updatedAt` | internal | Operational metadata |

## Notes

- `landBlock`/`landParcel` are **required for publication** (completeness rule,
  Phase 4) but are **not publicly displayed** — the public sees `district`
  only. This is a deliberate privacy decision recorded here.
- Changing any row requires updating `listing-classification.ts` in the same
  pull request; the test suite enforces consistency with the public projection.
