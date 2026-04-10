---
mcp-resource-id: "core/mcp-specification"
mcp-version: "1.20.1"
mcp-priority: 100
mcp-category: "core"
mcp-module: "specification"

title: "Wenex Model Context Protocol (MCP) Specification"
description: "Official definition of the Model Context Protocol (MCP) – the standard for how AI agents discover, read, understand, and interact with structured information inside the Wenex platform and its ecosystem."
tags: ["core", "specification", "ai-agents", "platform"]

last-updated: "2026-04-10"
---

# Wenex Model Context Protocol (MCP)

## 1. Introduction

The **Wenex Model Context Protocol (MCP)** is the official standard that enables **AI agents** to discover, read, understand, query, and interact with all structured information inside the Wenex platform in a secure, consistent, and predictable way.

### Wenex Platform & Ecosystem Overview

**Wenex** is a unified platform designed for building collaborative applications that seamlessly integrate human users and AI agents.  

The ecosystem consists of multiple **standard clients** (applications) built on the same set of platform protocols. Each client can have its own business logic, user interface, and specialized features, while all clients interoperate securely inside a shared collaboration environment called the **coworkers space**.

Key elements of the Wenex ecosystem:

- **Platform** — Central system responsible for storing resources, enforcing access control, coordinating clients, and providing MCP endpoints.
- **Clients** — Applications (backend + frontend) built with the official Wenex SDK. Clients implement domain-specific business logic.
- **Users** — Human users who authenticate through a client and interact with its features.
- **AI Agents** — Autonomous or semi-autonomous agents that operate inside or across clients using the MCP to access and manipulate data. agent should interaction with platform operations with a user or client authorization token. APT (Auth Personal Token) token is required for agents.
- **Coworkers Space** — A secure, platform-managed shared environment where multiple clients (and their associated AI agents) can discover each other, share resources, and coordinate actions under strict access rules.

All data in Wenex is organized as **resources** — named collections of **documents**. This design is deliberately aligned with modern document-oriented databases (such as MongoDB), making it intuitive for AI agents trained on document-based systems.

> **Note**: The platform only manages data structure, storage, versioning, and access control. All business logic remains the responsibility of the individual clients.

## 2. Terms and Definitions

- **Platform**: The central Wenex system that stores all **resources**, coordinates clients and AI agents, and strictly enforces access rules.
- **Client**: An application built according to Wenex rules using the official SDK. It includes backend and frontend components and implements its own business logic.
- **User**: A person who registers or logs into a client and uses its features.
- **AI Agent**: An autonomous or assistive entity that uses the MCP to discover, read, and interact with resources inside the Wenex platform and coworkers space.
- **Coworkers Space**: A secure, shared collaboration environment where multiple clients and their AI agents can interact, discover resources, and coordinate actions under platform-controlled permissions.
- **Document**: A single, complete entry inside a resource (e.g., one user, one project, one task, one file metadata entry, etc.). Documents are the fundamental unit of data.
- **Resource**: A named collection of similar documents (for example: `users`, `projects`, `documents`, `tasks`, `messages`). Each resource defines the schema and structure of its documents.

## 3. Core Concepts

The Wenex platform organizes all information as **resources**. Every resource supports the same simple, predictable set of CRUD-style operations. These operations are intentionally minimal and consistent so AI agents can easily discover them, reason about them, and call them reliably.

### Core Schema (Base Properties)

Almost every resource extended by this core schema properties, all these properties are optional within creation and update operations method, most of them automatically filled by platform. DO NOT invent values for core properties. Leave empty if not explicitly mentioned by the user.

- `id`: Primary identifier (MongoDB ObjectId as hex string)
- `ref`: External reference identity used for integration with old systems with legacy databases. Must be unique within a specific resource, is required for wenex migration solution.
- `owner`: User ID (MongoDB ObjectId) from "identity/users" resource who owns this resource. A document can only have one owner at a time.
- `shares`: List of user IDs explicitly granted share-level access to this resource.
- `groups`: Groups allowed to access this resource from groups of "identity/users". Each item can be a MongoDB ObjectId, an email address or a domain (FQDN).
- `clients`: List of client IDs allowed to access this resource. Clients that are not mentioned here may can read this data base on user interaction with other clients that are not co-worker with this client but could not run any operation that make changes on it.
- `created_at`: Creation timestamp
- `created_by`: User ID who created the record
- `created_in`: Client ID where creation occurred
- `updated_at`: Last update timestamp
- `updated_by`: User ID who last updated
- `updated_in`: Client ID where update occurred
- `deleted_at`: Soft-delete timestamp
- `deleted_by`: User ID who performed soft-delete
- `deleted_in`: Client ID where delete occurred
- `restored_at`: Restore timestamp (undo soft-delete)
- `restored_by`: User ID who restored
- `restored_in`: Client ID where restore occurred
- `identity`: A reference/relation to a MongoDB ObjectId within the Wenex ecosystem. this could be populate from mongodb id to any resource of wenex platform resources. should be explicitly mentioned to populate it. DO NOT guess this value.
- `relations`: A list of references/relations to a MongoDB ObjectId within the Wenex ecosystem. this could be populate from mongodb id to any resource of wenex platform resources. should be explicitly mentioned to populate it. DO NOT guess this value.
- `description`: A sentence indexed as text for full-text search. You (the AI) can generate a short, relevant summary based on the user request if not explicitly provided.
- `version`: Semantic version (SemVer) of this resource.
- `props`: A JSON free schema to store unusual fields not mentioned in the original schema.
- `tags`: List of tags for categorization. You (the AI) can infer 1 or 2 relevant tags (matching /^[\\w\\-._]+(:[\\w\\-._]+)?$/) based on the context, otherwise leave empty.
- `rand`: a random string value filled with digits, automatically generated and cloud not change it.
- `timestamp`: a timestamp string value stored in database, filled with digits, automatically generated and cloud not change it.

### Foundational Operations

All operations are designed to return rich metadata (including creator, updater, timestamps, and access-control fields) to help AI agents maintain context and audit trails.

- **Count**  
  Returns the number of documents in a resource that match a given query.  
  *AI agent use case*: Fast cardinality checks, existence verification, or pagination planning without loading full data.

- **Create**  
  Creates exactly one new document in the specified resource.  
  Returns the fully stored document, including system-generated fields (ID, creation timestamp, creator info, access metadata).

- **Create Bulk**  
  Creates multiple documents in a single operation.  
  Accepts an array of documents and behaves like repeated `Create` calls, but more efficiently.

- **Find**  
  Retrieves an array of documents from a resource that match the provided query/filter.

- **Find One**  
  Retrieves exactly one document by its unique identifier (`id`) when known in advance.

- **Update One**  
  Updates a single document by its `id`.  
  Returns the updated document together with update metadata (who updated it and in which client).

- **Update Bulk**  
  Updates all documents in a resource that match a given query.  
  Returns the total number of documents that were modified.

- **Delete One** (Soft Delete)  
  Marks a document as deleted by its `id`.  
  Returns the document with deletion metadata and timestamp. The document remains recoverable.

- **Restore One**  
  Restores a previously soft-deleted document by its `id`.  
  Returns the restored document with restore metadata and timestamp.

- **Destroy One** (Hard Delete)  
  Permanently removes a document by its `id`.  
  Returns the final state of the document just before destruction for auditing purposes.

These operations form the universal foundation for almost all interactions between AI agents and the Wenex platform. Because they are uniform across almost every resource, agents can learn a single interaction pattern and apply it reliably throughout the entire ecosystem.
