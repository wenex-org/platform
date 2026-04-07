---
mcp-resource-id: "core/mcp-specification"
mcp-version: "1.20.1"
mcp-priority: 100

mcp-category: "core"
mcp-module: "specification"
mcp-audience: ["platform-agent", "client-agent"]

title: "Wenex Model Context Protocol Specification"
description: "Official definition of the Model Context Protocol (MCP) – the standard for how AI agents discover, read, and consume project documentation."

tags: ["core", "specification"]
last-updated: "2026-04-07"
---

# Wenex Model Context Protocol (MCP)

## 1. Introduction

The Wenex ecosystem consists of multiple applications that follow standardized protocols, allowing them to discover, interact, and collaborate seamlessly.

### Terms and Definitions

- **Platform**: The central system (Wenex) that stores all resources and coordinates communication between clients using standardized rules and access controls.
- **Client**: An application built according to the platform’s specifications and SDK. It contains a backend and a frontend. Clients are responsible for implementing their own business logic.
- **User**: A person who registers or authenticates through a client and interacts with the client’s features.

> **Note**: Clients handle business logic. The platform manages resource structure, storage, and enforces strict access control.

## 2. Core Concepts

The Wenex platform is built around **resources** — categorized collections of data (e.g., users, products, posts, tickets).

Each resource supports the following standard operations:

- **Count**: Counts how many records match a specific query inside a given resource. Used when an agent needs to know the number of matching items without retrieving them.

- **Create**: Creates a single new record in the selected resource. The operation returns the newly created record, including automatically added fields: access control metadata, creator information, and creation timestamp.

- **Create Bulk**: Creates multiple records in the selected resource in one operation. It behaves like the `Create` operation but accepts an array of records instead of a single record.

