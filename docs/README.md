# Wenex Document

## Schema's

- [Base Schema](./schemas/core.md)

## Common Resource Methods

All Wenex services that manage persistent entities (most of them) follow a very consistent method naming and signature pattern for data access and modification.

These methods are usually implemented in:

- **Repository layer** (MongoDB / Typegoose / Mongoose)
- **Service layer** (business logic wrapper)
- **Controller / gRPC / GraphQL resolvers** (public exposure)

They share the same philosophy:

- Every write/read operation carries **`Metadata`** (who is calling, from which client, auth context, tenant info…)
- Strong typing via generics `<T>` (entity), `<D>` (DTO/input)
- Observables (RxJS) as return type → async streaming + cancellation support
- Separation of **soft-delete** (`delete` / `restore`) and **hard-delete** (`destroy`)
- Support for both **single** and **bulk** operations
- Filter / query abstraction that supports ownership, sharing, client scoping, soft-delete visibility, etc.

## Common Parameters

| Parameter   | Type              | Description                                                                                   | Always present? |
|-------------|-------------------|-----------------------------------------------------------------------------------------------|-----------------|
| `meta`      | `Metadata`        | Authentication & context: user, client, roles, request IP, trace id, tenant, language…         | Yes             |
| `filter`    | `Filter<T>`, `QueryFilter<T>`, `FilterOne<T>`, `FilterID<T>` | Conditions (where clause), pagination, sorting, projection, ownership checks…                 | Yes             |
| `data` / `update` | `D` or `Optional<D>` or `Items<D>` | Input payload (create) or partial update object                                               | For mutations   |

## Method Overview Table

| Method signature                              | Purpose                              | Returns                              | Soft-delete aware? | Bulk support? | Typical HTTP equivalent |
|-----------------------------------------------|--------------------------------------|--------------------------------------|--------------------|---------------|--------------------------|
| `count(...)`                                  | Count matching records               | `Observable<Total>`                  | Yes                | —             | `GET /resource?count=true` |
| `create(...)`                                 | Create one record                    | `Observable<Data<Serializer<T>>>`    | —                  | No            | `POST /resource`         |
| `createBulk(...)`                             | Create many records                  | `Observable<Items<Serializer<T>>>`   | —                  | Yes           | `POST /resource/bulk`    |
| `find(...)`                                   | Find many (paginated/list)           | `Observable<Items<Serializer<T>>>`   | Yes                | —             | `GET /resource`          |
| `cursor(...)`                                 | Streaming / cursor-based iteration   | `Observable<Serializer<T>>`          | Yes                | —             | Server-sent events / gRPC stream |
| `findOne(...)`                                | Find exactly one (throws if not unique or missing) | `Observable<Data<Serializer<T>>>` | Yes                | —             | `GET /resource/one`      |
| `findById(...)`                               | Find by `_id`                        | `Observable<Data<Serializer<T>>>`    | Yes                | —             | `GET /resource/:id`      |
| `deleteOne(...)` / `deleteById(...)`          | **Soft-delete** one record           | `Observable<Data<Serializer<T>>>`    | Yes (sets `deleted_at`) | No       | `DELETE /resource/:id`   |
| `restoreOne(...)` / `restoreById(...)`        | **Undo soft-delete**                 | `Observable<Data<Serializer<T>>>`    | Yes (clears `deleted_at`) | No    | `POST /resource/:id/restore` |
| `destroyOne(...)` / `destroyById(...)`        | **Hard-delete** (permanent)          | `Observable<Data<Serializer<T>>>`    | No                 | No            | `DELETE /resource/:id?force=true` |
| `updateBulk(...)`                             | Update many matching records         | `Observable<Total>`                  | Yes                | Yes           | `PATCH /resource/bulk`   |
| `updateOne(...)`                              | Update one matching record           | `Observable<Data<Serializer<T>>>`    | Yes                | No            | `PATCH /resource/one`    |
| `updateById(...)`                             | Update by `_id`                      | `Observable<Data<Serializer<T>>>`    | Yes                | No            | `PATCH /resource/:id`    |

## Important Concepts & Behaviors

### 1. Metadata (`meta: Metadata`)

Almost every method receives a `Metadata` object containing:

- `user` / `uid` – acting user
- `client` / `cid` – calling client/application
- `account` / `aid` – current account context (if multi-account user)
- `roles`, `scopes`, `groups` – permissions
- `ip`, `agent`, `tz`, `lang` – context for auditing & responses
- `traceId`, `spanId` – observability

This object is used to:

- Enforce ownership (`owner === meta.uid`)
- Apply share/group/client visibility
- Record `created_by`, `updated_by`, `deleted_by`, …
- Decide which fields are readable/writable

### 2. Filter types

Different filter shapes exist for different needs:

- `Filter<T>` → list / pagination / complex conditions
- `QueryFilter<T>` → count / bulk update (no projection, no sort limit usually)
- `FilterOne<T>` → expects 0 or 1 result (throws if >1)
- `FilterID<T>` → `{ id: string }` shorthand

All filters automatically apply:

- Soft-delete filter (`deleted_at: null`) unless explicitly requested
- Ownership / share / group / client scoping based on `meta`

### 3. Return types

- `Data<T>` = `{ data: T }`
- `Items<T>` = `{ items: T[], total?: number, limit?: number, offset?: number, … }`
- `Total` = `{ total: number }`
- `Serializer<T>` = transformed/read-projected version of entity (usually without secrets)

### 4. Soft vs Hard Delete

- `delete*` → sets `deleted_at`, `deleted_by`, `deleted_in` (soft delete)
- `restore*` → clears those fields
- `destroy*` → physically removes document (use with extreme care)

Most business logic uses soft-delete to allow audit trail, undo, and recovery.

### 5. Bulk operations

`createBulk` and `updateBulk` are optimized paths:

- Usually use MongoDB bulkWrite / insertMany
- Return only summary (`total` affected) or full inserted items (configurable)
- Still fully respect ownership / validation / events per document

### Summary – Most common real-world calls

Operation               | Typical method used
------------------------|---------------------------
List records            | `find` or `find(…)` with pagination
Get single item         | `findById` or `findOne`
Create new record       | `create`
Update existing         | `updateById`
Soft delete             | `deleteById`
Permanently delete      | `destroyById` (admin only)
Count dashboard stats   | `count`
Mass update (e.g. status change) | `updateBulk`

This uniform interface dramatically reduces cognitive load when working across 15+ microservices and makes SDK / client library generation much simpler.
