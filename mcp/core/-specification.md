---
mcp-resource-id: "core/mcp-specification"
mcp-version: "1.20.1"
mcp-priority: 100
mcp-category: "core"
mcp-module: "specification"

title: "Wenex Model Context Protocol (MCP) Specification"
description: "Official definition of the Model Context Protocol (MCP) — the standard governing how AI agents discover, read, understand, query, and interact with structured information inside the Wenex platform and its ecosystem."
tags: ["core", "specification", "platform", "resources"]

last-updated: "2026-04-10"
---

# Wenex Model Context Protocol (MCP)

## 1. Introduction

The **Wenex Model Context Protocol (MCP)** is the official standard that enables **AI agents** to discover, read, understand, query, and interact with all structured information inside the Wenex platform in a secure, consistent, and predictable manner.

### 1.1 Wenex Platform & Ecosystem Overview

**Wenex** is a unified platform for building collaborative applications (clients) that seamlessly integrate human users and AI agents.

The ecosystem consists of multiple **standard clients** (applications) built on the same set of platform protocols. Each client may have its own business logic, user interface, and specialized features, while all clients interoperate securely inside a shared collaboration environment called the **Coworkers Space**. Within the Coworkers Space, multiple clients and their AI agents can discover collections, coordinate actions, and interact — all under platform-controlled permissions.

#### Key Elements

| Element      | Description |
|--------------|-------------|
| **Platform** | The central system responsible for storing documents, enforcing access control, coordinating clients, and exposing MCP endpoints. |
| **Clients**  | Applications (backend + frontend) built with the official Wenex SDK. Clients implement domain-specific business logic and may register their own custom resources. |
| **Users**    | Human users who authenticate through a client and interact with its features. |

All data in Wenex is organized as **resources**. A resource is the canonical identifier of a collection within a service. Collections are logically grouped into **services** for discoverability and organization. This design follows modern microservice and document-oriented storage patterns, making it intuitive for AI agents.

> **Note:** The platform manages only data structure, storage, versioning, and access control. All business logic remains the responsibility of the individual clients. Clients may define and register custom resources; these are stored and managed by the platform exactly like built-in resources.

---

## 2. Terminology

| Term | Definition |
|------|------------|
| **Auth Personal Token (APT)** | A token used to authenticate with the platform's core operations. AI agents should consult the MCP resource `docs://core/auth-specification` to guide the user through obtaining one. |
| **AI Agent** | An autonomous or assistive entity that uses MCP to discover, read, and interact with resources inside the Wenex platform and Coworkers Space. Almost every operation requires a valid APT. |
| **Service** | A logical namespace that groups related collections sharing the same domain or functionality (e.g., `auth`, `domain`, `context`, `identity`). |
| **Resource** | The canonical identifier of a collection within a service, written as `service/collection` (or `service/collection.field[.field]` when targeting a specific schema property). Use this exact format consistently in all MCP interactions. |
| **Zone** | Defines the scope of an AI agent's activity over data in the platform. See [Access Control Model](#access-control-model) for details. |

### 2.1 Token Identity

Every access token (including APTs) provides three properties that identify the caller:

| Property | Source Resource | Present When |
|----------|----------------|--------------|
| `uid` | `identity/users.id` | A human user is logged in. |
| `aid` | `domain/apps.id` | A user logged in through an application, or an application logged in independently. |
| `cid` | `domain/clients.id` | Always present — every login occurs through a client. |

The effective **token identity** is resolved using the following priority (highest → lowest):

1. **`uid`** — if present, the token represents a user-level identity.
2. **`aid`** — if `uid` is absent, the token represents an application-level identity.
3. **`cid`** — fallback; represents a client-only identity.

### 2.2 Metadata Parameters

Metadata parameters are request-level headers that an AI agent can set to influence platform behavior. Below are the common parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x-zone` | `string` | `own,share` | Defines the requested [zone](#access-control-model) scope. |
| `x-request-id` | `string` | *(none)* | A unique identifier per request, used to track the operation's execution. |
| `x-no-api-response` | `boolean` | `false` | When `true`, the response body is suppressed (only the HTTP status is returned). Useful when the response payload is predictable or unneeded. |
| `x-exclude-soft-delete-query` | `boolean` | `false` | When `true`, soft-deleted documents are included in query results. By default, soft-deleted data is excluded. |

---

## 3. Core Concepts

The Wenex platform organizes all information as **collections** under **services** (collectively referred to as **resources**). Every resource supports the same predictable set of CRUD-style operations. These operations are intentionally minimal and consistent, so AI agents can learn them once and apply them reliably across the entire ecosystem.

### 3.1 Resource Identification

> **For AI Agents:**
>
> - Always use the full `service/collection` path (or `service/collection.field` when targeting a specific schema property) when referring to any collection. This path-based naming makes discovery and cross-service referencing straightforward and unambiguous.
> - To retrieve the complete list and definitions of all built-in resources, query the MCP resource `docs://core/resource-specification`.

### 3.2 Core Schema (Base Properties)

Almost every document in any collection extends this core schema. All properties below are **optional** during `Create` and `Update` operations — most are automatically filled by the platform.

> ⚠️ **AI Agent Guidance:** Do **NOT** invent values for core properties. Leave them empty (or omit them) unless the user or client explicitly provides a value.

| Property | Type / Format | Description |
|----------|---------------|-------------|
| `id` | 24-character hex string (MongoDB ObjectId) | Primary identifier. Auto-generated by the platform. |
| `ref` | `string` | External reference for legacy-system integration. Must be unique within the collection. |
| `owner` | 24-character hex string | User ID (`identity/users`) who owns this document. One owner only. |
| `shares` | `string[]` (24-char hex) | User IDs explicitly granted share-level access. |
| `groups` | `(string \| email \| FQDN)[]` | Groups allowed access (from `identity/users.groups`). |
| `clients` | `string[]` (24-char hex) | Client IDs allowed to access this document. Unlisted clients may read via user interaction but cannot write. |
| `created_at` | ISO 8601 datetime | Creation timestamp. Auto-filled. |
| `created_by` | 24-character hex string | User ID who created the document (from `identity/users`). |
| `created_in` | 24-character hex string | Client ID where creation occurred (from `domain/apps` or `domain/clients`). |
| `updated_at` | ISO 8601 datetime | Last-update timestamp. Auto-filled. |
| `updated_by` | 24-character hex string | User ID who last updated the document. |
| `updated_in` | 24-character hex string | Client ID where the update occurred. |
| `deleted_at` | ISO 8601 datetime | Soft-delete timestamp. Auto-filled on soft delete. |
| `deleted_by` | 24-character hex string | User ID who performed the soft delete. |
| `deleted_in` | 24-character hex string | Client ID where the delete occurred. |
| `restored_at` | ISO 8601 datetime | Restore timestamp. Auto-filled on restore. |
| `restored_by` | 24-character hex string | User ID who restored the document. |
| `restored_in` | 24-character hex string | Client ID where the restore occurred. |
| `identity` | Resource reference 24-character hex string | Single reference/relation to another Wenex resource. Do not guess values. |
| `relations` | Resource reference 24-character hex string[] | List of references/relations to other Wenex resources. Do not guess values. |
| `description` | `string` | Short sentence used for full-text search. AI agents may generate a relevant summary if omitted. |
| `version` | SemVer string | Document version. |
| `props` | `object` (free-schema JSON) | Additional fields not defined in the official schema. |
| `tags` | `string[]` matching `/^[\w\-._]+(:[\w\-._]+)?$/` | Categorization tags. AI agents may infer 1–2 relevant tags based on context; otherwise leave empty. |
| `rand` | Digit-only string | Auto-generated random string. Read-only. |
| `timestamp` | Digit-only string | Auto-generated timestamp string. Read-only. |

### 3.3 Foundational Operations

All operations return rich metadata (including creator, updater, timestamps, and access-control fields) to help AI agents maintain full context and audit trails.

> **Key principle:** These operations are identical across every resource — both built-in and custom. An AI agent only needs to learn this single interaction pattern to work reliably with the entire Wenex ecosystem.

| Operation | Description | Returns |
|-----------|-------------|---------|
| **Count** | Returns the number of documents in a `service/collection` matching a given query. *Use for cardinality checks, existence verification, or pagination planning.* | Document count. |
| **Create** | Creates exactly one new document. | The fully stored document with all auto-filled system fields. |
| **Create Bulk** | Creates multiple documents in a single call. Accepts an array. | An array of fully stored documents. |
| **Find** | Retrieves documents matching the provided query/filter. | An array of full documents with metadata. |
| **Find One** | Retrieves exactly one document by its `id`. | The document, or `null`. |
| **Update One** | Updates a single document by `id`. | The updated document with new metadata. |
| **Update Bulk** | Updates all documents matching a query. | The count of modified documents. |
| **Delete One** *(Soft Delete)* | Marks a document as deleted by `id`. | The document with deletion metadata. |
| **Restore One** | Restores a soft-deleted document by `id`. | The restored document with restore metadata. |
| **Destroy One** *(Hard Delete)* | Permanently removes a document by `id`. | The final document state before destruction (for auditing). |

### 3.4 Access Control Model

#### Zone

The `x-zone` metadata parameter is the most important access-control mechanism per request. It defines the **scope** of an AI agent's activity over data, and is strongly tied to the base fields `owner`, `shares`, `groups`, and `clients`.

**Default behavior:**

| Scenario | Default `x-zone` |
|----------|-------------------|
| Read-only operations | `own,share` — data owned by or shared with the user, across all clients. |
| Write operations | `own,share` — the platform automatically apply the `client` zone for write actions. |

**Zone combination logic:**

| Combination | Logic |
|-------------|-------|
| `group` + `client` | Combined with **AND** — documents matching *both* zone are included. |
| `own` + `share` | Combined with **OR** — documents matching *either* zone are included. |
| (`own` and/or `share`) + (`client` and/or `group`) | Combined with **AND** — documents must match both sides. |

> **Note:** If a requested zone is not permitted by the AI agent's token, the platform silently ignores that zone.

#### Grants

The platform access control model is base on ABAC (Attribute-Based Access Control), a grant is the smallest unit of an ABAC permission, It tells you whether a `subject` is allowed to perform a specific `action` on a specific `object/resource`. user subjects are specified within `identity/users.subjects` resource.

Grants are scoped to have more fine-grained version of a grant to apply precise restrictions instead of broad/all-or-nothing, Scoping is done by appending a scope after a colon (`:`) in the `action` or `object/resource` name. default scope (when nothing is specified) is usually `any` for actions and `all` for objects.

Scoping allows you to express rules like: "User can only read their own articles" instead of "User can read all articles".

Wenex common action Scopes: `own`, `share`, `group` and `client` (e.t. `create:own`, `update:share`, `restore:group`)
Wenex object/resource Scopes: collection within services it's like a resource (e.t. `identity:users`, `users` is scope)

Grant Definition Example (how you define a scoped grant):

```ts
{
  "subject": "user@wenex.org",
  "action": "create:own",           // scoped action
  "object": "article",              // can be scoped too, e.g. "article:published"
  "field": ["*", "!owner"]          // optional: allow all fields except "owner", apply on request body
  "filter": ["*", "!description"]   // optional: allow all fields except "description", apply on response body
}
```

A Grant is strongly tied to the base fields `owner`, `shares`, `groups`, and `clients`.

> Note: AI agents should always define scopes if wants to create a new grant

subjects within the wenex platform are postfixed by user `domain` - domain is a unique identifier in FQDN format for each token, each domain in wenex ecosystem provided by the `domain/clients.domains[].name` (`name` is a nested field of object array `domains`), each client can have multiple `domain` but a token can have only one of them in a same time.
