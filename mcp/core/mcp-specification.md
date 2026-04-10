---
mcp-resource-id: "core/mcp-specification"
mcp-version: "1.20.1"
mcp-priority: 100
mcp-category: "core"
mcp-module: "specification"

title: "Wenex Model Context Protocol Specification"
description: "Official definition of the Model Context Protocol (MCP) – the standard for how AI agents discover, read, and consume structured information and collaborate inside the Wenex platform."
tags: ["core", "specification"]

last-updated: "2026-04-07"
---

# Wenex Model Context Protocol (MCP)

## 1. Introduction

The Wenex Model Context Protocol (MCP) is the official standard that allows **AI agents** to discover, read, understand, and interact with all structured information inside the Wenex platform.

The Wenex ecosystem consists of multiple standard applications built on the same platform protocols. These applications (clients) can collaborate securely with each other inside a dedicated shared environment called the **coworkers** space.

## 2. Terms and Definitions

- **Platform**: The central system (Wenex) that stores all **resources**, coordinates clients, and enforces access rules.
- **Client**: An application built according to the platform rules. It uses the official Wenex SDK and consists of a backend and a frontend.
- **User**: A person who registers or logs into a client and uses that client’s features according to its business logic.
- **Coworkers**: A secure, shared collaboration environment where multiple clients (and their AI agents) can interact, share resources, and coordinate actions under strict platform-controlled access rules.
- **Record**: A single, complete entry inside a resource (one user, one project, one document, etc.).
- **Resource**: A named collection of similar records (for example: `users`, `projects`, `documents`, `tasks`). It defines the type and structure of the data.

> **Note**: Clients are responsible for implementing all business logic. The platform only manages resource structure and strictly enforces access rules.

## 3. Core Concepts

The Wenex platform organizes all information as **resources**. Every resource supports the same simple and predictable set of core operations. These operations are designed to be easy for AI agents to understand, call, and reason about.

- **Count**  
  Counts how many records match a given query inside a specific resource.  
  *Use case for AI agents*: Quickly check the total number of matching items without fetching the full list.

- **Create**  
  Creates exactly one new record in the selected resource.  
  The operation returns the fully stored record, including automatically added access-control metadata, creator information, and creation timestamp.

- **Create Bulk**  
  Creates multiple records in the selected resource at the same time.  
  It works exactly like the `Create` operation, except it accepts an array of records instead of a single record.

- **Find**
  Fetch an array of records match a given query inside a specific resource.

- **Find One**
  Fetch only one record by record identity (id) if you know it before.

- **Delete One**
  Soft delete one record by record identity (id) if you know it before.
  The operation returns the fully stored record, delete information, and deletion timestamp.

- **Restore One**
  Restore soft-deleted record by record identity (id) if you know it before.
  The operation returns the fully stored record, restore information, and restore timestamp.

- **Destroy One**
  Hard delete (destroy) one record by record identity (id) if you know it before. return the latest data already exists before destroy.

- **Update Bulk**
  Update bulk of records match a given query inside a specific resource. return total number of resource changed.

- **Update One**
  update a single record by record identity (id) if you know it before.
  The operation returns the fully stored record, update information ( update **by** which user and **in** which client ), and update timestamp.

These operations form the foundation of almost all interactions between AI agents and the Wenex platform.
