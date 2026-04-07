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

The Wenex Model Context Protocol (MCP) defines a clear, standardized way for **AI agents** to discover, read, and work with structured information inside the Wenex platform.

The Wenex ecosystem consists of standard applications built on Wenex platform protocols. These applications are designed to interact with each other seamlessly.

### Terms and Definitions

- **Platform**: The central system (Wenex) that stores all **resources** and coordinates clients in **coworkers** space using fixed, standardized rules.
- **Client**: An application built according to the platform rules. It uses the official Wenex SDK and has two parts: backend and frontend.
- **User**: A person who registers or logs into a client and uses the client’s features according to that client’s business logic.

> **Note**: Clients implement all business logic. The platform only manages the resource structure and strictly controls access levels.

## 2. Core Concepts

The Wenex platform organizes everything as **resources**. Every resource supports the same set of core operations. These operations are designed to be simple, predictable, and easy for AI agents to understand and use.

- **Count**  
  Counts how many records match a given query inside a specific resource.  
  Used when an AI agent needs to know the total number of matching items without retrieving them.

- **Create**  
  Creates exactly one new record in the selected resource.  
  The operation returns the fully stored record, including automatically added access-control metadata, creator information, and creation timestamp.

- **Create Bulk**  
  Creates multiple records in the selected resource at the same time.  
  It works exactly like the `Create` operation, except it accepts an array of records instead of a single record.

These three operations form the basis of most interactions between AI agents and the Wenex platform.