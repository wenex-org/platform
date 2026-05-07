---
title: "Powerful Prompt"
claude-extensions: [rtk, code-review-graph, superpowers]
---

Prepare a refactor plan for MCP (Model Context Protocol) specification documentations in the `mcp/**/*.md` and the server tools definition exists in the `apps/gateway/src/**/*.router.ts` files, then execute it. Refactor the specific client `mcp-client.ts` for the Wenex platform to act like a standard MCP client available to every user (Claude, GPT, or other MCP clients). Refactor the MCP client by ollama usage; feel free to ask me any question to produce an efficient and elegant MCP server and client. I want you to produce the final production-ready version for agents to assist user intent in the Wenex platform.

Move the system prompt and other necessary client-side tools from `mcp-client.ts` to the server MCP tools definition files `*.router.ts` and the `mcp/**/*.md` specification documents. alongside MongoDB query teaching, add some training content to teach agents to draw diagrams and charts using Mermaid in their markdown responses.

NOTE: THERE IS NO NEED TO RUN GIT AND TEST COMMANDS.

## Sources of Truth (precedence order)

1. @wenex-org/platform → `apps/gateway/src` (controllers, routers, resolvers — external surface only)
2. @wenex-org/platform-libs → enum files + `common/src/schemas/map.ts` (enums, types, population paths)
3. Existing MCP spec prose → `mcp/readme.md`, `mcp/core/...` and `mcp/service/...` directories

Ignore internal-only methods, classes, and interfaces unless they directly define externally visible runtime behavior.

## Content Rules

- Enums: only values confirmed by platform-libs enum files
- Population: only paths confirmed by `map.ts`; label others as "raw ID – not a confirmed population path"
- Mark fields as write-only / platform-managed / serializer-hidden where applicable; never expose them in examples
- Do not invent operations, enums, population paths, headers, or tool names not confirmed by runtime sources
- Do not remove safety warnings

## File Rules

- **Compact:** shorter, decision-first, safety-first, low-token; defer detail to extended
- **Extended:** semantically identical to compact, fuller rationale, richer examples, stronger agent guidance
- Do not merge the two files into one
