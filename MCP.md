# Powerful Prompt - [Github Copilot](https://github.com/copilot)

Give me refactor plan for MCP (Model Context Protocol) specification documentations and the server tools definition exists in the `apps/gateway/src/**/*.router.ts` files and refactor the specific client `mcp-client.ts` for the wenex platform to act like common MCP client exists for almost every user (claude, gpt, or other mcp clients), refactor the mcp client by ollama usage, feel free to ask me any question to produce efficient and elegant mcp server and client, i want you to produce final production-ready version for agents to assist user intent in the wenex platform.

Move the system prompt and other necessary client-side tools from `mcp-client.ts` to the server MCP tools definition files `*.router.ts` and the `mcp/**/*.md` specification documents. alongside MongoDB query teaching, add some training content to teach agents to draw diagrams and charts using Mermaid in their markdown responses.

NOTE: THERE IS NO NEED TO RUN GIT TESTS AND COMMANDS.

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
