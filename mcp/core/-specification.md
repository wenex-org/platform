---
mcp-resource-id: "core/mcp-specification"
mcp-version: "1.20.1"
mcp-priority: 100
mcp-category: "core"
mcp-module: "specification"

title: "Wenex Model Context Protocol (MCP) Specification"
description: "Official definition of the Model Context Protocol (MCP) – the standard for how AI agents discover, read, understand, query, and interact with structured information inside the Wenex platform and its ecosystem."
tags: ["core", "specification", "ai-agents", "platform", "services", "collections", "discovery"]

last-updated: "2026-04-10"
---

# Wenex Model Context Protocol (MCP)

## 1. Introduction

The **Wenex Model Context Protocol (MCP)** is the official standard that enables **AI agents** to discover, read, understand, query, and interact with all structured information inside the Wenex platform in a secure, consistent, and predictable way.

### Wenex Platform & Ecosystem Overview

**Wenex** is a unified platform designed for building collaborative applications (clients) that seamlessly integrate human users and AI agents.  

The ecosystem consists of multiple **standard clients** (applications) built on the same set of platform protocols. Each client can have its own business logic, user interface, and specialized features, while all clients interoperate securely inside a shared collaboration environment called the **coworkers space**. In the coworkers space, multiple clients and their AI agents can discover collections, coordinate actions, and interact under platform-controlled permissions.

Key elements of the Wenex ecosystem:

- **Platform** — Central system responsible for storing documents, enforcing access control, coordinating clients, and providing MCP endpoints.
- **Clients** — Applications (backend + frontend) built with the official Wenex SDK. Clients implement domain-specific business logic and may register their own custom resources.
- **Users** — Human users who authenticate through a client and interact with its features.

All data in Wenex is organized as **resources**. A resource is the canonical identifier of a collection within a service. Collections are logically grouped into **services** for better organization and discoverability. This design follows modern microservice patterns and document-oriented storage, making it intuitive for AI agents.

> **Note**: The platform only manages data structure, storage, versioning, and access control. All business logic remains the responsibility of the individual clients. Clients may define and register their own custom resources; these are stored and managed by the platform exactly like built-in resources.

## 2. Terms and Definitions

- **Auth Personal Token (APT)**: A token is given to work with the platform's core operations to guide the user to obtain this token. The AI ​​agent should look up the MCP resource `docs://core/auth-specification`.
- **AI Agent**: An autonomous or assistive entity that uses the MCP to discover, read, and interact with resources inside the Wenex platform and coworkers space. Almost every operation requires a valid **Auth Personal Token (APT)** access token.
- **Service**: A logical namespace that groups related collections sharing the same domain or functionality. Some built-in services that are always present include `auth`, `domain`, `context`, `identity` and etc.
- **Resource**: The canonical identifier of a collection within a service, written as `service/collection` (or optionally `service/collection.field` when targeting a specific schema property). Use this exact format consistently in all MCP interactions and agent reasoning.
- **Token Identity**: Every Access token also APT provides three properties that identify the caller:
  - `uid` — User identity from the `identity/users.id` resource (present only when a human user is logged in).
  - `aid` — Application identity from the `domain/apps.id` resource (present when user logged in through an application or only an application logged in).
  - `cid` — Client identity from the `domain/clients.id` resource (always present, because every login occurs through a client).
  
  The effective **token identity** is determined by this priority order (highest to lowest):
  - Use `uid` if it exists (user-level token).
  - Otherwise use `aid` if it exists (application-level token).
  - Otherwise use `cid` (client-only token).

Clients can define additional custom resources; these are stored on the platform using the same `service/collection` model.

## 3. Core Concepts

The Wenex platform organizes all information as **collections** under **services** (collectively called **resources**). Every resource supports the same simple, predictable set of CRUD-style operations. These operations are intentionally minimal and consistent so AI agents can discover them once and apply them reliably across the entire ecosystem.

**Resource Identification (for AI Agents)**:

- Always use the full `service/collection` path (or `service/collection.field` when targeting a specific schema property) when referring to any collection. This path-based naming makes collection discovery and cross-service referencing straightforward and unambiguous.
- To discover and retrieve the complete list and definitions of all built-in resources an AI agent must query the `docs://core/resource-specification` MCP resource.

### Core Schema (Base Properties)

Almost every document in any collection extends this core schema. All these properties are **optional** during `Create` and `Update` operations. Most are automatically filled by the platform. **DO NOT invent values** for core properties. Leave them empty (or omit them) unless explicitly provided by the user or client.

| Property       | Type / Format                          | Description / AI Guidance |
|----------------|----------------------------------------|---------------------------|
| `id`           | 24-character hexadecimal string | Primary identifier. Auto-generated. |
| `ref`          | String                                 | External reference identity for legacy-system integration. Must be unique within the collection. |
| `owner`        | 24-character hex string                | User ID from `identity/users` who owns this document (one owner only). |
| `shares`       | Array of 24-character hex strings      | List of user IDs explicitly granted share-level access. |
| `groups`       | Array of (24-character hex string \| email \| FQDN) | Groups allowed to access this document (from `identity/users.groups`). |
| `clients`      | Array of 24-character hex strings      | Client IDs allowed to access this document. Unlisted clients may read via user interaction but cannot write. |
| `created_at`   | ISO datetime string                    | Creation timestamp (auto-filled). |
| `created_by`   | 24-character hex string                | User ID who created the document (from `identity/users`). |
| `created_in`   | 24-character hex string                | Client ID where creation occurred (from `domain/apps` or `domain/clients`). |
| `updated_at`   | ISO datetime string                    | Last update timestamp (auto-filled). |
| `updated_by`   | 24-character hex string                | User ID who last updated the document. |
| `updated_in`   | 24-character hex string                | Client ID where the update occurred. |
| `deleted_at`   | ISO datetime string                    | Soft-delete timestamp (auto-filled on soft delete). |
| `deleted_by`   | 24-character hex string                | User ID who performed the soft-delete. |
| `deleted_in`   | 24-character hex string                | Client ID where the delete occurred. |
| `restored_at`  | ISO datetime string                    | Restore (undo soft-delete) timestamp. |
| `restored_by`  | 24-character hex string                | User ID who restored the document. |
| `restored_in`  | 24-character hex string                | Client ID where the restore occurred. |
| `identity`     | Resource reference object              | Single reference/relation to any other Wenex resource. Do not guess values. |
| `relations`    | Array of resource reference objects    | List of references/relations to any Wenex resources. Do not guess values. |
| `description`  | String                                 | Short sentence for full-text search. AI agents may generate a relevant summary if omitted. |
| `version`      | Semantic version string (SemVer)       | Document version. |
| `props`        | Free-schema JSON object                | Additional fields not defined in the official schema. |
| `tags`         | Array of strings matching `/^[\w\-._]+(:[\w\-._]+)?$/` | Categorization tags. AI agents may infer 1–2 relevant tags based on context; otherwise leave empty. |
| `rand`         | Digit-only string                      | Automatically generated random string – cannot be changed. |
| `timestamp`    | Digit-only string                      | Automatically generated timestamp string – cannot be changed. |

### Foundational Operations

All operations return rich metadata (including creator, updater, timestamps, and access-control fields) to help AI agents maintain full context and audit trails.

- **Count**  
  Returns the number of documents in a `service/collection` that match a given query.  
  *AI use case*: Fast cardinality checks, existence verification, or pagination planning.

- **Create**  
  Creates exactly one new document. Returns the fully stored document with all auto-filled system fields.

- **Create Bulk**  
  Creates multiple documents in one call. Accepts an array and returns an array of fully stored documents.

- **Find**  
  Retrieves an array of documents matching the provided query/filter. Returns full documents with metadata.

- **Find One**  
  Retrieves exactly one document by its `id`. Returns the document or `null`.

- **Update One**  
  Updates a single document by `id`. Returns the updated document with new metadata.

- **Update Bulk**  
  Updates all documents matching a query. Returns the count of modified documents.

- **Delete One** (Soft Delete)  
  Marks a document as deleted by `id`. Returns the document with deletion metadata.

- **Restore One**  
  Restores a soft-deleted document by `id`. Returns the restored document with restore metadata.

- **Destroy One** (Hard Delete)  
  Permanently removes a document by `id`. Returns the final state before destruction for auditing.

These operations are identical across every resource (built-in and custom). An AI agent only needs to learn this single interaction pattern to work reliably with the entire Wenex ecosystem.

