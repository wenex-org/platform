---
mcp-resource-id: "core/mcp-specification"
mcp-version: "1.20.1"
mcp-priority: 100

mcp-category: "core"
mcp-module: "specification"
mcp-audience: ["platform-agent", "client-agent"]

title: "Wenex Model Context Protocol Specification"
description: "Official definition of the Model Context Protocol (MCP) – the standard for how AI agents discover, read and consume project documentation."

tags: ["core", "specification"]
last-updated: "2026-04-07"
---

# Wenex Model Context Protocol (MCP)

## 1. Introduction

The Wenex ecosystem provides a set of standard applications based on the Wenex platform protocols that can easily interact with each other.

### Terms and Definitions

- **Platform**: The central application responsible for storing all resources and coordinating clients according to standardized rules. Wenex serves as this platform.
- **Client**: An application developed according to the platform’s rules and regulations, typically using the platform’s SDK. It consists of a backend and a frontend.
- **User**: A person who registers or logs into a client and uses its features according to the client’s business logic.

> **Note**: Clients are responsible for implementing business logic, while the platform focuses on managing resource structure and enforcing tightly controlled access levels.

## 2. Core Concepts

The Wenex platform organizes its functionality around categorized **resources**. Each resource supports the following core operations:

- **Count**: Counts the number of records that match a given query within a specific resource, based on the user’s request.
- **Create**: Creates a new record in the selected resource. Returns the stored record enriched with access control metadata, creator information, and creation timestamp.
- **Create Bulk**: Creates multiple records in the selected resource at once. It has the same behavior as the `Create` operation, except it accepts an array of records instead of a single record.
