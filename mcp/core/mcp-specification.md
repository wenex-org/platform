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

**Wenex** is a unified platform designed for building collaborative applications that seamlessly integrate human users and AI agents.  

The ecosystem consists of multiple **standard clients** (applications) built on the same set of platform protocols. Each client can have its own business logic, user interface, and specialized features, while all clients interoperate securely inside a shared collaboration environment called the **coworkers space**.

Key elements of the Wenex ecosystem:

- **Platform** — Central system responsible for storing collections, enforcing access control, coordinating clients, and providing MCP endpoints.
- **Clients** — Applications (backend + frontend) built with the official Wenex SDK. Clients implement domain-specific business logic and may register their own custom collections.
- **Users** — Human users who authenticate through a client and interact with its features.
- **AI Agent**: An autonomous or semi-autonomous entity that operates inside or across clients using the MCP to access and manipulate data. Agents **must** interact with platform operations using a valid user or client authorization token. An **APT (Auth Personal Token)** is required for all agent-initiated operations.
- **Coworkers Space** — A secure, platform-managed shared environment where multiple clients (and their associated AI agents) can discover each other, share collections, and coordinate actions under strict access rules.

All data in Wenex is organized as **collections** — each a named group of similar **documents**. Collections are logically grouped into **services** for better organization and discoverability. This design is deliberately aligned with modern document-oriented databases (such as MongoDB), making it intuitive for AI agents trained on document-based systems.

> **Note**: The platform only manages data structure, storage, versioning, and access control. All business logic remains the responsibility of the individual clients. Clients may define and register their own custom collections; these are stored and managed by the platform exactly like built-in collections.

## 2. Terms and Definitions

- **Platform**: The central Wenex system that stores all **collections**, coordinates clients and AI agents, and strictly enforces access rules.
- **Client**: An application built according to Wenex rules using the official SDK. It includes backend and frontend components and implements its own business logic. Clients may define custom collections.
- **User**: A person who registers or logs into a client and uses its features.
- **AI Agent**: An autonomous or assistive entity that uses the MCP to discover, read, and interact with collections inside the Wenex platform and coworkers space. All operations require a valid APT (Auth Personal Token).
- **Coworkers Space**: A secure, shared collaboration environment where multiple clients and their AI agents can interact, discover collections, and coordinate actions under platform-controlled permissions.
- **Service**: A logical namespace that groups related collections sharing the same domain or functionality (`auth`, `domain`, `context`, `identity` are some of the built-in services that are always present). To discover built-in service functionality and supported operations, query the `service-specification` MCP resource id.
- **Collection**: A named group of similar documents inside a service (e.g., users collection, products collection, etc.)..
- **Document**: A single, complete entry inside a collection (e.g., one user, one project, one task, one file metadata entry, etc.). Documents are the fundamental unit of data.
- **Resource**: The canonical identifier of a collection within a service, written as `service/collection` (or optionally `service/collection.field`). Use this format consistently in all MCP interactions and agent reasoning.

Clients can define additional custom collections; these are stored on the platform using the same `service/collection` model. To work with or develop against a client backend, refer to the `client-specification` MCP resource id.

## 3. Core Concepts

The Wenex platform organizes all information as **collections** under **services**. Every resource supports the same simple, predictable set of CRUD-style operations. These operations are intentionally minimal and consistent so AI agents can easily discover them, reason about them, and call them reliably.

### Resource Identification (for AI Agents)

Always use the full `service/collection` path (or `service/collection.field` when targeting a specific schema property) when referring to any collection. This path-based naming makes collection discovery and cross-service referencing straightforward and unambiguous for agents.

### Core Schema (Base Properties)

Almost every document extends this core schema. All these properties are **optional** during Create and Update operations. Most are automatically filled by the platform. **DO NOT invent values** for core properties. Leave them empty (or omit them) unless explicitly provided by the user or client.

- `id`: Primary identifier (MongoDB ObjectId as hex string)
- `ref`: External reference identity used for integration with legacy systems. Must be unique within the specific collection and is required for the Wenex migration solution.
- `owner`: User ID (MongoDB ObjectId) from `identity/users` who owns this document. A document can have only one owner at a time.
- `shares`: List of user IDs explicitly granted share-level access to this document.
- `groups`: Groups allowed to access this document (from the `identity/users.groups` field). Each item can be a MongoDB ObjectId, an email address, or a domain (FQDN).
- `clients`: List of client IDs allowed to access this document. Clients not listed may read the data based on user interaction with other clients but cannot perform any write operations.
- `created_at`: Creation datetime
- `created_by`: User ID who created the document
- `created_in`: Client ID where creation occurred
- `updated_at`: Last update datetime
- `updated_by`: User ID who last updated the document
- `updated_in`: Client ID where the update occurred
- `deleted_at`: Soft-delete datetime
- `deleted_by`: User ID who performed the soft-delete
- `deleted_in`: Client ID where the delete occurred
- `restored_at`: Restore datetime (undo soft-delete)
- `restored_by`: User ID who restored the document
- `restored_in`: Client ID where the restore occurred
- `identity`: A reference/relation to any service collections within the Wenex ecosystem. Must be explicitly requested for population. Do not guess this value.
- `relations`: A list of references/relations to any service collections within the Wenex ecosystem. Must be explicitly requested for population. Do not guess this value.
- `description`: A sentence indexed as text for full-text search. AI agents may generate a short, relevant summary if not explicitly provided.
- `version`: Semantic version (SemVer) of this document.
- `props`: Free-schema JSON object to store additional fields not defined in the official schema.
- `tags`: List of tags for categorization. AI agents may infer 1–2 relevant tags (matching `/^[\w\-._]+(:[\w\-._]+)?$/`) based on context; otherwise leave empty.
- `rand`: Automatically generated random string (digits only) – cannot be changed.
- `timestamp`: Automatically generated timestamp string (digits only) – cannot be changed.

### Foundational Operations

All operations are designed to return rich metadata (including creator, updater, timestamps, and access-control fields) to help AI agents maintain full context and audit trails.

- **Count**  
  Returns the number of documents in a `service/collection` that match a given query.  
  *AI agent use case*: Fast cardinality checks, existence verification, or pagination planning without loading full data.

- **Create**  
  Creates exactly one new document in the specified `service/collection`.  
  Returns the fully stored document, including automatically added system fields (ID, creation timestamp, creator info, access-control metadata).

- **Create Bulk**  
  Creates multiple documents in a single operation in the specified `service/collection`.  
  Accepts an array of documents and behaves like repeated `Create` calls, but more efficiently. Returns the array of fully stored documents.

- **Find**  
  Retrieves an array of documents from a `service/collection` that match the provided query/filter.  
  Returns the matching documents (with full metadata).

- **Find One**  
  Retrieves exactly one document by its unique `id` from a `service/collection`.  
  Returns the full document or null if not found.

- **Update One**  
  Updates a single document by its `id` in the specified `service/collection`.  
  Returns the updated document together with update metadata (`updated_by`, `updated_in`, `updated_at`).

- **Update Bulk**  
  Updates all documents in a `service/collection` that match a given query.  
  Returns the total number of documents that were modified.

- **Delete One** (Soft Delete)  
  Marks a document as deleted by its `id` in the specified `service/collection`.  
  Returns the document with deletion metadata and timestamp. The document remains recoverable.

- **Restore One**  
  Restores a previously soft-deleted document by its `id` in the specified `service/collection`.  
  Returns the restored document with restore metadata and timestamp.

- **Destroy One** (Hard Delete)  
  Permanently removes a document by its `id` in the specified `service/collection`.  
  Returns the final state of the document just before destruction for auditing purposes.

These operations form the universal foundation for almost all interactions between AI agents and the Wenex platform. Because they are uniform across every collection (including client-defined custom resources), agents can learn a single interaction pattern and apply it reliably throughout the entire ecosystem.