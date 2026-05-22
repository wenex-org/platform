---
# title: "Powerful Prompt"
claude-extensions: [rtk, code-review-graph, superpowers]
---

# MCP Documentation Update — Refactor Plan

> **Mode:** Plan only. No code changes, no git, no test commands.
> **Output:** One structured plan document with exact file targets and compact/extended callouts.

## Ground Rules

- **Two files always:** `compact` and `extended` are always separate — never merge them.
- **Same facts, different depth:** compact is directive-first, low-token; extended adds rationale and examples.
- **No invention:** only operations, enums, DTOs, serializers, population paths, and tool names confirmed by runtime sources.
- **Hidden fields:** mark write-only / platform-managed / serializer-hidden fields clearly; never expose in examples.

## Sources of Truth (in priority order)

1. `@wenex-org/platform` → `apps/gateway/src` — controllers, modules, resolvers (external surface only)
2. `@wenex-org/platform-libs` → enum/DTO/serializer files + `libs/common/src/schemas/map.ts`
3. Existing MCP prose → `mcp/readme.md`, `mcp/core/`, `mcp/service/`

Ignore internal-only methods unless they define externally visible runtime behavior.

## Plan Items

### 1. Shared Resource Tools

**File:** `libs/common/src/core/mcp/resource.mcp.ts`

All `<method>_<service>_<collection>` tools were removed from individual routers and consolidated into shared tools with a new `resource` input field.

- Collect every removed tool name across all `mcp/**/*.md` files
- Map each to its shared equivalent; document the `resource` input convention
- List `mcp/**/*.md` files referencing old per-router names → plan corrections

### 2. Services & Collections Audit

**Path:** `apps/gateway/src/modules/<service>/crafts/<collection>/`

- Diff current DTOs and serializers against what each doc describes
- Flag: stale fields, missing fields, wrong types, write-only / platform-managed / serializer-hidden
- Cross-check all population paths against `map.ts`; flag any not confirmed there
- `identity` and `relations`: document as raw IDs that may populate to any platform resource
- List file targets with specific changes required (no edits — plan only)

### 3. Scope Documentation

**Source:** `apps/gateway/src` → controller decorators

- Extract all required scopes per endpoint from decorators
- Map each scope to its corresponding tool(s) in `mcp/**/*.md`
- Flag docs missing scope requirements entirely
- List file targets and exact scope annotations to add

### 4. Entry Point Guide

**File:** identify exact path during analysis

- Locate the current entry point document
- Plan an agent instruction block: *"Before calling any scope-restricted tool, read the current user's scopes and verify access"*
- Place at top-level, before tool listings
- Compact: directive only. Extended: adds rationale and examples.

### 5. Loader Tool Description

**File:** `libs/common/src/core/mcp/loader.mcp.ts`

- Read the current `description` string
- Identify gaps for agent comprehension
- Draft improved description following the pattern:
  `'<one-sentence action>. For schema details read "docs://core/<service>-specification"'`
- Must be self-sufficient for standard MCP clients (Claude Desktop, Cursor) that don't call `read_documentations`

## Deliverable Format

For each plan item:

- Exact file targets
- What each file needs: additions, removals, corrections
- Explicit `compact` vs `extended` callout per change
