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

Terms and Definitions:

- Platform: The central application responsible for storing all resources from clients and coordinating clients according to its standard rules. Wenex is this platform.
- Client: An application developed according to the platform’s rules and regulations, typically using the platform’s software development kit. It consists of two main parts: backend and frontend.
- User: A person who registers or logs into a client and uses its features according to the client’s business logic.

> Note: Clients implement the business logic, while the platform primarily manages `resource structure` and enforces tightly controlled `access levels`.

## 2. Core Concepts

The Wenex platform is a collection of categorized resources. These resources generally support the following core operations:

- **Count**: Used to count the number of records that match a given query within a specific resource, based on the user’s request.
- Create: This operation is used to create a new record in the selected resource type. The result returned is the record that was stored in the database, enriched with access control metadata as well as information about the creator and creation timestamp.
- Create Bulk: This operation has the same behavior as the `Create` function, except that instead of accepting a single record, it accepts multiple records for that resource and creates them all at once.
