---
mcp-resource-id: "core/mcp-specification"
mcp-version: "1.20.2"
mcp-priority: 100
mcp-category: "core"
mcp-module: "specification"
title: "Wenex Model Context Protocol (MCP) Specification"
description: "Official definition of the Model Context Protocol (MCP) — the standard governing how AI agents discover, read, understand, query, and interact with structured information inside the Wenex platform and its ecosystem. Includes enhanced guidance for AI agents on secure handling of Auth Personal Tokens (APT) and user-assistance protocols."
tags: ["core", "specification", "platform", "resources", "ai-agent", "authentication"]
last-updated: "2026-04-11"
---

# Wenex Model Context Protocol (MCP)

## 1. Introduction

The **Wenex Model Context Protocol (MCP)** is the official standard that enables **AI agents** to discover, read, understand, query, and interact with all structured information inside the Wenex platform in a secure, consistent, and predictable manner.

AI agents are designed to **assist human users** by leveraging the user's own **Auth Personal Token (APT)**. This allows agents to act securely on the user's behalf within the Coworkers Space while respecting all platform access-control rules.

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
| **Auth Personal Token (APT)** | A long-lived, user-scoped token that authenticates every request to the platform. An APT carries the caller's identity (`uid`, `aid`, `cid`) and determines what data the caller can access. AI agents **must** possess a valid, user-provided APT before performing any platform operation. See [§2.3](#23-auth-personal-token-apt--lifecycle--usage) for the full lifecycle. |
| **AI Agent** | An autonomous or assistive entity that uses MCP to discover, read, and interact with resources inside the Wenex platform and Coworkers Space. Every operation performed by an AI agent **requires a valid user-provided APT**. |
| **Service** | A logical namespace that groups related collections sharing the same domain or functionality (e.g., `auth`, `domain`, `context`, `identity`). |
| **Resource** | The canonical identifier of a collection within a service, written as `service/collection` (or `service/collection.field[.field]` when targeting a specific schema property). Use this exact format consistently in all MCP interactions. |
| **Zone** | Defines the scope of an AI agent's activity over data in the platform. See [§3.4](#34-access-control-model) for details. |

### 2.1 Token Identity

Every access token (including APTs) provides three properties that identify the caller:

| Property | Source Resource       | Present When |
|----------|-----------------------|--------------|
| `uid`    | `identity/users.id`   | A human user is logged in. |
| `aid`    | `domain/apps.id`      | A user logged in through an application, or an application logged in independently. |
| `cid`    | `domain/clients.id`   | Always present — every login occurs through a client. |

The effective **token identity** is resolved using the following priority (highest → lowest):

1. **`uid`** — if present, the token represents a user-level identity.
2. **`aid`** — if `uid` is absent, the token represents an application-level identity.
3. **`cid`** — fallback; represents a client-only identity.

> **AI Agent Note:** When assisting a user, the agent inherits the `uid` from the supplied APT. All operations are performed under the user's identity and within the zones the user is permitted to access.

### 2.2 Metadata Parameters

Metadata parameters are request-level headers that an AI agent can set to influence platform behavior:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x-zone` | `string` | `own,share` | Defines the requested [zone](#341-zone) scope. |
| `x-request-id` | `string` | *(none)* | A unique identifier per request, used for execution tracking and traceability. |
| `x-no-api-response` | `boolean` | `false` | When `true`, the response body is suppressed (only the HTTP status is returned). Useful when the response payload is predictable or unneeded. |
| `x-exclude-soft-delete-query` | `boolean` | `false` | When `true`, soft-deleted documents are included in query results. By default, soft-deleted data is excluded. |

### 2.3 Auth Personal Token (APT) — Lifecycle & Usage

The APT is the **single credential** an AI agent uses to act on behalf of a user. This section describes the full lifecycle so agents can handle tokens correctly in every scenario.

#### 2.3.1 How an APT Is Obtained

An AI agent **cannot create an APT on its own**. The user must generate one through an authenticated client flow. The detailed steps are documented in `docs://core/auth-specification`. When no APT is available, the AI agent **must**:

1. Inform the user that a valid APT is required before any platform operation can proceed.
2. Explain in plain language:
   - **What** an APT is — a personal access token that lets the agent act as the user.
   - **Why** it is needed — every platform operation requires authenticated identity.
   - **How to treat it** — with the same care as a password.
3. Direct the user to `docs://core/auth-specification` for step-by-step generation instructions.
4. Wait for the user to supply the token. **Never guess or fabricate** an APT value.

#### 2.3.2 How an AI Agent Receives the APT

The APT is supplied to the AI agent through one of the following mechanisms (in order of preference):

| Mechanism | Description |
|-----------|-------------|
| **Session / Environment Variable** | The hosting environment injects the APT automatically (e.g., `WENEX_APT` environment variable). The agent reads it at startup. |
| **Secure Client-Provided Input** | The user provides the APT through a secure, client-provided input mechanism (preferred over plain chat when available). |
| **User-Provided in Conversation** | The user sends the APT directly to the agent during a conversation. |
| **Secure Credential Store** | The agent retrieves the APT from a platform-approved secret manager or vault. |

> **Storage rule:** Once received, the agent stores the token **only for the current session** unless the user explicitly authorizes longer-term secure storage.

#### 2.3.3 Attaching the APT to Requests

Every request to the Wenex platform **must** include the APT. The standard mechanism is the HTTP `Authorization` header using the `Bearer` scheme:

```
Authorization: Bearer <APT>
```

The agent inherits the user's `uid`, zones, and grants automatically from the token.

#### 2.3.4 Token Validation Checklist

Before executing any platform operation, run through this checklist:

```text
✅ APT is present and non-empty.
✅ APT has not been marked as expired or revoked in a prior response.
✅ The operation's required zone/scope is compatible with the token's identity level (uid > aid > cid).
✅ If a previous request returned 401/403, the user has been prompted and a new APT obtained.
```

#### 2.3.5 APT Error Handling Matrix

| HTTP Status | Meaning | Agent Action |
|-------------|---------|--------------|
| `401 Unauthorized` | APT is missing, malformed, expired, or revoked. | **Stop immediately.** Inform the user. Guide them to generate a new APT via `docs://core/auth-specification`. **Never retry with the same token.** |
| `403 Forbidden` | APT is valid but the identity lacks the required grant for this operation. | Explain the missing permission clearly. Suggest the user request the appropriate grant from an administrator. **Never attempt to work around a permission denial.** |
| `200 OK` (empty result) | Token is valid but the requested zone returned no data. | Inform the user. Suggest broadening the `x-zone` parameter if appropriate. |

#### 2.3.6 Token Revocation

If the user wishes to revoke the current APT (e.g., when ending a session, rotating credentials, or for security reasons), the agent **must**:

1. Guide the user to the revocation steps in `docs://core/auth-specification`.
2. Discard the stored token from the current session immediately.
3. Remind the user that they can also revoke tokens at any time from their client dashboard.

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
| `identity` | 24-character hex string (resource reference) | Single reference/relation to another Wenex resource. Do not guess values. |
| `relations` | 24-character hex string[] (resource references) | List of references/relations to other Wenex resources. Do not guess values. |
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

> ⚠️ **Reminder:** Every operation in this table requires a valid APT in the `Authorization: Bearer <APT>` header. If the APT is missing or invalid, the platform will reject the request (see [§2.3.5](#235-apt-error-handling-matrix)).

### 3.4 Access Control Model

#### 3.4.1 Zone

The `x-zone` metadata parameter is the most important access-control mechanism per request. It defines the **scope** of an AI agent's activity over data, and is strongly tied to the base fields `owner`, `shares`, `groups`, and `clients`.

**Default behavior:**

| Scenario | Default `x-zone` |
|----------|-------------------|
| Read-only operations | `own,share` — data owned by or shared with the user, across all clients. |
| Write operations | `own,share` — the platform automatically applies the `client` zone for write actions. |

**Zone combination logic:**

| Combination | Logic |
|-------------|-------|
| `group` + `client` | Combined with **AND** — documents matching *both* zones are included. |
| `own` + `share` | Combined with **OR** — documents matching *either* zone are included. |
| (`own` and/or `share`) + (`client` and/or `group`) | Combined with **AND** — documents must match both sides. |

> **Note:** If a requested zone is not permitted by the AI agent's token, the platform silently ignores that zone.

#### 3.4.2 Grants

The platform access control model is based on **ABAC (Attribute-Based Access Control)**. A **grant** is the smallest unit of an ABAC permission — it tells the platform whether a `subject` is allowed to perform a specific `action` on a specific `object/resource`. User subjects are specified within the `identity/users.subjects` resource.

Grants are **scoped** to provide fine-grained restrictions instead of broad all-or-nothing rules. Scoping is done by appending a scope after a colon (`:`) in the `action` or `object/resource` name. The default scope (when nothing is specified) is usually `any` for actions and `all` for objects.

Scoping allows you to express rules like: *"User can only read their own articles"* instead of *"User can read all articles."*

**Wenex common action scopes:** `own`, `share`, `group`, `client` (e.g., `create:own`, `update:share`, `restore:group`)

**Wenex object/resource scopes:** A collection within a service acts as a scope (e.g., `identity:users`, where `users` is the scope).

**Grant definition example (scoped grant):**

```jsonc
{
  "subject": "user@wenex.org",
  "action": "create:own",             // scoped action
  "object": "article",                // can be scoped too, e.g. "article:published"
  "field": ["*", "!owner"],           // optional: allow all fields except "owner" — applied to request body
  "filter": ["*", "!description"]     // optional: allow all fields except "description" — applied to response body
}
```

A grant is strongly tied to the base fields `owner`, `shares`, `groups`, and `clients`.

> **AI Agent Note:** When creating new grants on behalf of a user, always define explicit scopes to follow the **principle of least privilege**. Never create unscoped grants unless explicitly instructed by the user.

#### 3.4.3 Domains & Subjects

Subjects within the Wenex platform are postfixed by the user's **domain** — a unique identifier in FQDN format associated with each token. Each domain in the Wenex ecosystem is provided by `domain/clients.domains[].name` (`name` is a nested field of the `domains` object array). A client may support multiple domains, but any single token is associated with exactly **one** domain at a time.

---

## 4. AI Agent Interaction Playbook

This section provides prescriptive, step-by-step guidance for AI agents operating within the Wenex platform. Follow these procedures exactly to ensure secure, consistent behavior.

### 4.1 Bootstrapping — First Contact With a User

When an AI agent begins a new session with a user, execute the following steps **in order**:

```text
STEP 1 → Check whether an APT is available (environment variable, credential store, or prior conversation).
          ├─ APT found → Go to STEP 3.
          └─ APT not found → Go to STEP 2.

STEP 2 → Inform the user:
          "To interact with the Wenex platform on your behalf, I need a valid Auth Personal Token (APT).
           This token lets me perform actions as you, with the same permissions you have.
           Please treat it like a password.
           Follow the steps in the authentication guide to generate one."
          Reference: docs://core/auth-specification
          Wait for the user to provide the APT → Go to STEP 3.

STEP 3 → Validate the APT by performing a lightweight read operation
          (e.g., Find One on `identity/users` using the token's own `uid`).
          ├─ 200 OK        → APT is valid. Greet the user by name if available. Proceed.
          ├─ 401 Unauthorized → Inform the user the token is invalid or expired. Go to STEP 2.
          └─ 403 Forbidden   → Token is valid but lacks basic read permissions. Suggest contacting an admin.
```

### 4.2 Performing Operations on Behalf of the User

For every user request that requires a platform operation, follow this decision tree:

```text
1. Identify the target resource (service/collection).
2. Identify the required operation (Count, Create, Find, Update, Delete, etc.).
3. Confirm the APT is still valid (check the in-memory status from the last request).
4. Determine the appropriate x-zone:
   ├─ User asks about "my data"        → x-zone: own
   ├─ User asks about "shared with me" → x-zone: share
   ├─ User asks about "team data"      → x-zone: group
   └─ Default / unspecified            → x-zone: own,share
5. Construct the request:
   ├─ Header: Authorization: Bearer <APT>
   ├�� Header: x-zone: <zone>
   ├─ Header: x-request-id: <generated-uuid> (recommended for traceability)
   └─ Body: only fields explicitly provided by the user (do NOT invent values).
6. Execute the request and interpret the response.
7. On success → present results to the user in a clear, structured format.
8. On failure → follow the error handling matrix (§2.3.5).
```

### 4.3 Common User Intents — Quick Reference

| User Says (Example) | Agent Action |
|----------------------|--------------|
| *"Show me my documents"* | `Find` on the relevant resource with `x-zone: own`. |
| *"What has been shared with me?"* | `Find` on the relevant resource with `x-zone: share`. |
| *"Create a new [item]"* | `Create` on the target resource. Only include fields the user provided. |
| *"Delete [item]"* | `Delete One` (soft delete) by `id`. **Confirm with the user before executing.** |
| *"Permanently remove [item]"* | `Destroy One` (hard delete) by `id`. **Always ask for explicit confirmation.** |
| *"Who can see this?"* | Read the document's `owner`, `shares`, `groups`, and `clients` fields and explain them. |
| *"Grant [user] access to [item]"* | `Update One` to add the user's ID to the `shares` array, or create a scoped grant if fine-grained control is needed. |
| *"I got an error / it's not working"* | Check the last HTTP status code. Follow the [error handling matrix](#235-apt-error-handling-matrix). |
| *"I want to revoke my token"* | Guide the user through revocation steps (see [§2.3.6](#236-token-revocation)). Discard the token from the session. |

### 4.4 Security & Privacy Rules for AI Agents

| Rule | Detail |
|------|--------|
| **Never expose the APT** | Do not echo, log, display, or include the APT in user-visible output, error messages, or analytics pipelines. |
| **Never fabricate an APT** | If no APT is available, ask the user. Never generate a placeholder or dummy token. |
| **Never share the APT** | Do not transmit the APT to other agents, clients, or services without explicit user consent. |
| **Never bypass zone restrictions** | Do not set `x-zone` to a broader scope than the user's intent requires. |
| **Never retry with an expired token** | If a request returns 401, stop and prompt the user for a new APT. |
| **Never work around 403** | Do not attempt to circumvent a permission denial. Explain the situation and suggest the user contact an administrator. |
| **Confirm destructive actions** | Always ask for explicit user confirmation before `Delete One`, `Destroy One`, or `Update Bulk` operations. |
| **Minimize data exposure** | When presenting results, show only fields relevant to the user's question. Do not dump raw API responses unless requested. |
| **Session-only storage** | Store the APT only for the current session unless the user explicitly authorizes longer-term secure storage. |
| **Remind about revocation** | If the user expresses security concerns, remind them they can revoke the APT at any time from their client dashboard or via `docs://core/auth-specification`. |

---

## 5. Appendix

### 5.1 Glossary of MCP Resource References

| MCP Resource URI | Purpose |
|------------------|---------|
| `docs://core/mcp-specification` | This document — the MCP protocol definition. |
| `docs://core/auth-specification` | Detailed guide for authentication, APT generation, token management, and revocation. |
| `docs://core/resource-specification` | Complete list and schemas of all built-in platform resources. |

### 5.2 Quick-Start Checklist for New AI Agents

```text
□ 1. Obtain a valid APT from the user (see §2.3).
□ 2. Validate the APT by calling Find One on `identity/users` (see §4.1).
□ 3. Discover available resources via `docs://core/resource-specification`.
□ 4. Use the foundational operations (§3.3) with proper Authorization and x-zone headers.
□ 5. Follow the security & privacy rules in §4.4 at all times.
□ 6. Handle errors using the matrix in §2.3.5.
□ 7. Support token revocation when the user requests it (§2.3.6).
```
