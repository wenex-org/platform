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

the Wenex is a comprehensive ecosystem for implementing a set of standard applications based on the Wenex platform protocols that can easily interact with each other.

Terms and literature:

- Platform: It is an application for storing all data from all clients and coordinating clients in its own standard way. Wenex is that platform.
- Client: An application that is developed based on the rules and regulations of the platform and generally uses the platform's software development kit. It consists of two main parts: backend and frontend.
- User: A user is someone who registers or logs in to a client and uses the features of that client based on the business logic of that client.

> Note: Clients implement the business logic, and the platform generally focuses on data structure and tightly controlled access levels.

## 2. Core Concepts

The Wenex platform is a collection of categorized resources, all of which generally have the following functions:

- Count: It is used to count the number of data items according to the user's request based on a query.
- Create: This function is used to create data of the selected source type. The result of executing this function is the same data that was stored in the database after executing the request, to which access control data and information about the creator and creation time are also added.
- Create Bulk: It has exactly the same function as the `create` function, except that instead of receiving one data, you can pass it multiple data and create a group of data at the same time.
