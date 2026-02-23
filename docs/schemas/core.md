## Key Fields in Core Interface

The `Core` interface defines a standardized set of fields shared by **all domain entities** across Wenex services. These fields ensure consistency in identification, ownership, access control, auditing, and extensibility.

| Field          | Type               | Required | Description                                                                 | Example / Notes                                      |
|----------------|--------------------|----------|-----------------------------------------------------------------------------|------------------------------------------------------|
| `id`           | string             | yes      | Primary identifier (MongoDB ObjectId as hex string)                         | Auto-generated on creation                           |
| `ref`          | string             | no       | Optional human-readable business reference                                  | Invoice number, order ID, SKU                        |
| `owner`        | string             | yes      | User ID (from `identity.users`) who owns the record                         | Single owner only — grants full "own" permissions    |
| `shares`       | string[]           | no       | List of user IDs explicitly granted share-level access                      | Permissions based on "share" actions                 |
| `groups`       | string[]           | no       | List of group identifiers (email domain, FQDN, or MongoID)                  | Matched against `groups` field in `identity.users`   |
| `clients`      | string[]           | yes      | List of allowed client IDs (from `domain.clients`)                          | Enforces application-level isolation                 |
| `created_at`   | Date               | yes      | Creation timestamp                                                          | —                                                    |
| `created_by`   | string             | yes      | User ID who created the record                                              | —                                                    |
| `created_in`   | string             | yes      | Client ID where creation occurred                                           | —                                                    |
| `updated_at`   | Date               | no       | Last update timestamp                                                       | —                                                    |
| `updated_by`   | string             | no       | User ID who last updated                                                    | —                                                    |
| `updated_in`   | string             | no       | Client ID where update occurred                                             | —                                                    |
| `deleted_at`   | Date               | no       | Soft-delete timestamp                                                       | Record hidden from normal queries                    |
| `deleted_by`   | string             | no       | User ID who performed soft-delete                                           | —                                                    |
| `deleted_in`   | string             | no       | Client ID where delete occurred                                             | —                                                    |
| `restored_at`  | Date               | no       | Restore timestamp (undo soft-delete)                                        | —                                                    |
| `restored_by`  | string             | no       | User ID who restored                                                        | —                                                    |
| `restored_in`  | string             | no       | Client ID where restore occurred                                            | —                                                    |
| `description`  | string             | no       | Optional free-form description                                              | —                                                    |
| `identity`     | string             | no       | Optional link to `identity.profiles` for display data                       | Avatar, full name, etc.                              |
| `props`        | Properties         | no       | Domain-specific extension properties (generic)                              | Varies per entity type                               |
| `tags`         | string[]           | no       | Free-form tags for filtering/search                                         | `["urgent", "europe", "q1-2026"]`                    |
| `version`      | string             | yes      | Semantic or incremental version                                             | Optimistic concurrency control                       |
| `rand`         | string             | yes      | Random string for cache-busting                                             | Changes on every update                              |
| `timestamp`    | string             | yes      | ISO string or Unix timestamp for ordering & change detection                | —                                                    |

## Access Control Model

The `Core` interface implements a **layered, hybrid RBAC/ABAC** model with four distinct access scopes. Permissions are evaluated in order: **Owner → Shares → Groups → Clients**. The first matching layer that grants the requested action determines access.

### 1. Owner (`owner`)
- Single user ID from `identity.users`
- Implicitly receives full permissions on **own** resources
- Supported actions:
  - `create:own`
  - `read:own`
  - `update:own`
  - `delete:own`
  - `restore:own`
  - `destroy:own`

### 2. Shares (`shares`)
- Explicit array of user IDs granted **share-level** access
- Supported actions:
  - `create:share`
  - `read:share`
  - `update:share`
  - `delete:share`
  - `restore:share`
  - `destroy:share`

### 3. Groups (`groups`)
- Array of group identifiers (email domain, FQDN, or MongoID)
- Evaluated against the acting user's `groups` field in `identity.users`
- Supported actions:
  - `create:group`
  - `read:group`
  - `update:group`
  - `delete:group`
  - `restore:group`
  - `destroy:group`

### 4. Clients (`clients`)
- Mandatory array of allowed client IDs from `domain.clients`
- Enforces application-level isolation (multi-tenancy, third-party apps)
- Supported actions:
  - `create:client`
  - `read:client`
  - `update:client`
  - `delete:client`
  - `restore:client`
  - `destroy:client`

**Permission Resolution**  
Access is granted if the acting principal satisfies **any** layer for the requested action. This model enables flexible scenarios:
- Personal data (owner only)
- Team collaboration (groups + shares)
- Tenant isolation (clients)
- Hybrid access (e.g., owner + specific shared users + group members)

All decisions are centrally enforced by the **auth** service using `grants` and APT/JWT claims.