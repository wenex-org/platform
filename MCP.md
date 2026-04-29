# Powerful prompts

Refactor the attached "-specification.compact.md" and "-specification.extended.md" markdown files for me, considering the prompt and refactoring checklist, respecting the knowledge provided in the files.

This is a modification to the MCP document specification for an AI agent to assist the user on the Wenex platform.

> Endpoints definition are in the apps/gateway/src directory of the @wenex-org/platform controllers/routers/inspectors.
> Find enum values in the @wenex-org/platform-libs enum directory and files.
> The @wenex-org/platform-libs sub-project is a git submodule to store common code and modules.
> Population paths are mentioned in the common/src/schemas/map.ts file from  @wenex-org/platform-libs repository.

NOTE: DO NOT MAKE A PULL REQUEST. CREATE ALL FILES HERE IN THIS CHAT. ALL YOUR NEEDED FILES AND REPOSITORIES ARE ATTACHED. IGNORE INTERNAL USE CLASSES AND INTERFACES.

## REFACTOR MCP SPEC PROMPT

```md
---
title: "Wenex MCP Specification Refactor Prompt"
description: "Prompt for refactoring Wenex MCP markdown specifications for stronger AI-agent usability, safety, determinism, and token efficiency while preserving protocol semantics."
last-updated: "2026-04-26"
---

# Wenex MCP Specification Refactor Prompt

You are refactoring the Wenex MCP documentation set into a cleaner, more AI-agent-optimized specification system.

Your goal is to improve these markdown specifications for **AI agent assistance**, while fully preserving the protocol semantics and constraints already defined in the existing Wenex MCP docs.

## Primary Objective

Refactor the MCP specification markdown files so that AI agents can:

1. determine what to load first with minimal ambiguity
2. distinguish normative rules from explanatory guidance
3. find required fields, operation semantics, population rules, and safety constraints faster
4. minimize token usage in routine sessions
5. escalate from compact to extended docs only when needed
6. avoid guessing behavior, enum values, scope semantics, zone semantics, or side effects
7. safely assist users without violating auth, grant, routing, or side-effect rules

Do **not** change protocol behavior unless a wording fix is necessary to remove ambiguity. Prefer structural improvement, normalization, and clarification over semantic change.

## Core Knowledge You Must Preserve

Preserve and respect the knowledge already defined in the current Wenex MCP docs, including:

- `docs://readme` is the routing entrypoint
- documentation families are split into:
  - core docs
  - service docs
- compact and extended versions carry the **same underlying knowledge**
- compact is the default
- extended is loaded for onboarding, troubleshooting, ambiguity, complex auth, complex filters, schema authoring, and complex tasks
- minimum startup sequence remains:
  1. `docs://core/specification`
  2. `docs://core/resource-specification`
  3. `docs://core/auth-specification` when auth, permissions, APTs, grants, scopes, subjects, or zones matter
- service docs are loaded on demand by user intent
- agents must never guess protocol behavior
- code/runtime behavior overrides prose when a mismatch is discovered
- APT requirements, auth limitations, zone rules, scope rules, grant rules, and real-world side-effect cautions must remain intact
- service-specific cautions must remain intact, especially for:
  - `auth`
  - `touch`
  - `special/files`
  - `financial`
  - `essential`
  - `thing`
  - `logistic`

Do **not** introduce contradictions between compact and extended versions.

## Non-Goals

Do **not**:

- create a pull request
- invent new Wenex protocol behavior
- invent enum values not supported by the docs
- remove safety warnings for brevity
- collapse compact and extended into one file
- change side-effect semantics
- imply auth endpoints are callable by MCP
- expose write-only secrets or hidden fields
- weaken grant / scope / zone distinctions

## Source-of-Truth Precedence

Make this hierarchy explicit wherever appropriate:

1. runtime / code behavior
2. schema / type definitions
3. current specification prose
4. examples

This must remain compatible with the existing rule that code/runtime overrides prose when mismatched.

## Refactoring Goals

### 1. Normalize the Documentation Architecture

Refactor the documentation set into a predictable architecture where every spec follows the same high-level pattern.

Target structure for every spec:

1. Frontmatter
2. Version banner
3. Purpose
4. When to load
5. What this doc contains / does not contain
6. AI Agent Quick Reference
7. Normative Rules
8. Resource or collection index
9. Operation model / tool patterns
10. Schema reference
11. Population rules
12. Query rules
13. Error / safety / side-effect rules
14. Examples
15. Cross references
16. Change sensitivity note

For service docs, ensure each collection follows a standard subsection layout:

- purpose
- required create fields
- optional fields
- update behavior
- population
- scope reference
- query tips
- examples
- cautions / caveats

### 2. Separate Normative vs Explanatory Content

Refactor wording so AI agents can easily distinguish:

- **Normative rules**: must, must not, never, required, only, default
- **Advisory guidance**: should, recommended, typical, commonly used
- **Examples**: clearly marked as non-normative

Use a consistent convention such as:

- `## AI Agent Quick Reference`
- `## Normative Rules`
- `## Agent Guidance`
- `## Examples`

Normative rules should be easy to scan and should not be buried inside long paragraphs.

### 3. Reduce Duplication Without Losing Clarity

Centralize these concepts in the most canonical location and reference them consistently elsewhere:

- APT lifecycle and handling
- zone semantics
- OAuth scope format
- grant action / object / field / filter semantics
- common population rules
- core schema field guidance
- CRUD operation naming
- MongoDB query operators
- query / populate / projection / pagination conventions
- side-effect confirmation rules

Service docs should restate only what is necessary for safe local use, then point back to canonical core sections.

### 4. Improve Compact Docs for Low-Token Loading

Ensure compact docs:

- are shorter
- lead with decision-critical facts
- omit repetitive explanation
- emphasize required fields, population, common queries, and safety
- clearly say when extended docs are needed

Ensure extended docs:

- preserve all detail
- include rationale, edge cases, caveats, and worked examples
- explain hidden serializer behavior, write-only fields, conditional validation, and known pitfalls

If a rule is safety-critical, include it in compact too.

### 5. Make Routing More Deterministic

Improve `docs://readme` and `docs://core/resource-specification` so an AI agent can answer quickly:

- which doc should I load first?
- when is compact enough?
- when must I escalate to extended?
- which service doc maps to this user request?
- which tasks require both core + service docs?
- which operations have real-world side effects?
- which docs are schema docs vs routing docs vs auth docs?

Add explicit decision tables where useful.

### 6. Improve Safety-Critical Discoverability

Refactor safety-critical constraints so they are highly visible and easy to scan.

These must remain highly discoverable:

- auth endpoints are not callable via MCP
- valid APT required before operations
- 401 vs 403 handling
- zones default and AI-agent override behavior
- difference between OAuth scopes and grant zones
- touch resources trigger real-world communication
- metrics are append-only / no update
- APT token values shown only once
- write-only fields must never be displayed
- `device` write-only semantics in `thing/metrics`
- file metadata vs binary upload distinction
- saga/backend-driven cautions
- subject/domain resolution rules
- coordinates in logistic examples use `[longitude, latitude]`

Use strong callouts and concise safety sections.

### 7. Standardize Examples

All examples should:

- use consistent JSON style
- include `headers` with `x-zone` when relevant
- avoid contradictions with schema rules
- be clearly labeled as examples
- prefer realistic values
- avoid implying unsupported behavior

When a field is auto-generated, write-only, platform-managed, or hidden by serializer, examples must not set it unless the spec explicitly allows it.

### 8. Add AI-Agent-Specific Quick References

For each major document, add a short **AI Agent Quick Reference** section near the top containing only the highest-value operational rules.

Examples:

- for core spec: APT required, set `x-zone`, do not invent core fields
- for auth: verify APT, distinguish scope vs grant, never call auth endpoints directly
- for touch: always confirm recipient/content/channel before create/send
- for financial: use `init_financial_transactions` not `create` for normal flows
- for special: use upload endpoints, do not invent storage metadata
- for thing: metrics are immutable, count before paginating high-frequency metrics

### 9. Improve Machine Readability

Refactor formatting to help AI parsing:

- consistent heading levels
- consistent section order
- consistent table column names
- consistent naming of “Required create fields”, “Optional fields”, “Population”, “Examples”
- avoid mixed terminology when one term is canonical
- avoid burying caveats in paragraphs when a warning block or dedicated section is better
- prefer short declarative sentences for rules
- preserve URI patterns exactly

### 10. Preserve Compact/Extended Symmetry

For every compact/extended pair:

- compact = minimal operational reference
- extended = same knowledge + explanation, rationale, examples, edge cases
- no contradictions
- no unique normative rule appearing only in extended unless compact explicitly points to it when omission would create unsafe behavior

## Required Structural Conventions

### A. Frontmatter

Preserve frontmatter semantics and MCP identity fields.

Do not change:

- `mcp-resource-id`
- `mcp-version`
- `mcp-priority`
- `mcp-category`
- `mcp-module`

unless there is an obvious metadata bug.

Update `last-updated` only if content changes.

### B. Version Banner

Immediately after frontmatter, preserve a version banner such as:

- compact: `This document is the **compact** version. If you are unfamiliar with documentation versions, read \`docs://readme\` first.`
- extended: `This document is the **extended** version. If you are unfamiliar with documentation versions, read \`docs://readme\` first.`

### C. End Marker

Preserve a clear end marker consistent with the current documentation style.

### D. Table Conventions

Use stable, machine-friendly tables.

Canonical field-table format for extended docs:

| Field | Required | Type | Validation | Description |
| --- | :---: | --- | --- | --- |

Compact docs may use a reduced form when necessary:

| Field | Required | Type | Description |
| --- | :---: | --- | --- |

Use:

- ✅ for required
- `—` for optional

When possible, name actual validators or constraints:

- `ArrayNotEmpty`
- `IsMongoId`
- `IsEmail`
- `KEY_PATTERN`
- `Min 0`
- `exactly 24 elements`

### E. Callout Conventions

Use a consistent set of callouts only:

> **AI Agent Rule:** mandatory behavior
>
> ⚠️ **AI Agent — Never do this:** prohibited behavior
>
> **Security:** security-sensitive behavior
>
> **Note:** explanatory clarification

Avoid ad hoc warning styles.

## Specific Refactoring Tasks

### 1. Refactor `docs://readme`

Make it a sharper AI router:

- start with a 30-second loading summary
- include a deterministic loading flow
- include “If user asks X, load Y” mappings
- include escalation triggers in checklist form
- make compact default behavior explicit and concise
- clearly distinguish:
  - routing docs
  - schema docs
  - auth docs
  - service docs

### 2. Refactor `docs://core/specification`

Make it the single canonical source for:

- MCP concepts
- resource naming
- operation naming
- core schema
- filter / query / populate / projection / pagination
- zones
- high-level AI-agent behavior
- APT-required behavior summary
- source-of-truth precedence

Service docs should reference this instead of re-explaining it.

### 3. Refactor `docs://core/auth-specification`

Make it the single canonical source for:

- APT semantics
- auth endpoint awareness
- decrypted token values
- OAuth scopes
- subjects
- grants
- 401 / 403 handling
- grant troubleshooting guidance

Explicitly reinforce:

- scopes are not grant zones
- subjects in token differ from grant subject formatting
- agents cannot call auth endpoints directly
- APT token values shown only once
- update behavior for APTs is unsupported

### 4. Refactor `docs://core/resource-specification`

Make it a pure service router/catalog:

- concise service mapping
- collection lists
- load-when rules
- cross-service task mapping
- service cautions
- quick routing tables

Avoid embedding too much schema detail.

### 5. Refactor Service Specifications

For each service spec:

- standardize section order
- move repeated core concepts back to core docs
- keep only service-specific schema, population, query guidance, caveats, and examples
- add an AI Agent Quick Reference near the top
- make side effects and non-obvious constraints prominent

Must retain and highlight service-specific safety:

- `touch`: real-world communication; confirm before send/create
- `special/files`: metadata is not binary; uploads use upload endpoints
- `financial`: use `init_financial_transactions` for normal flows
- `essential`: backend-driven / saga caution
- `thing`: metrics immutable; `device` write-only
- `logistic`: routing/geocode side semantics; coordinate order
- `identity`: write-only `password` and `secret`
- `domain`: auto-generated client secrets and subject-domain implications

### 6. Resolve Terminology Inconsistencies

Normalize terms such as:

- resource vs collection vs document
- create fields vs create schema
- population vs populate
- scope vs grant vs zone
- client vs app vs domain
- state vs status where both are present

Do not alter semantics; only clarify usage.

### 7. Enforce Accurate Population Rules

Only list population paths that are actually supported by the specs/source of truth.

When a field is a raw MongoId but not populatable, state that explicitly.

Examples that should remain clear:

- profile file fields are raw IDs, not auto-populated
- `thing/devices.location` is raw, not populatable
- `thing/metrics.device` is write-only
- `general/comments.mentions` and `attachments` are raw and not populatable

### 8. Standardize Special Operations

For each non-CRUD operation, use a stable structure:

- operation name
- tool name
- HTTP endpoint
- required scope
- returns
- input fields
- example
- response notes

Examples include:

- logistic geocode / address lookup / routing
- special file share
- stats collect / stackup
- financial init
- touch send endpoints
- essential start / add stage

### 9. Add AI Agent Playbooks to Extended Docs

Every extended spec should close with an AI-agent-oriented operational section containing:

- common user intents
- recommended tool/operation mapping
- anti-patterns / things agents commonly get wrong
- step-by-step flow for the most complex task in that service

Compact docs should instead contain a short “Common Patterns” section only.

## Quality Bar

The final refactoring should make these docs:

- easier for an AI agent to route
- safer for an AI agent to use
- faster to load in compact mode
- more canonical in core sections
- more uniform across services
- less redundant
- more explicit about what is normative vs explanatory

When in doubt, optimize for:

1. correctness
2. safety
3. deterministic loading
4. low-token operational clarity
5. consistency

## Output Requirements

Produce refactored markdown files in place.

For each rewritten file:

- preserve frontmatter semantics
- preserve MCP resource identity and versioning intent
- improve structure, headings, and readability
- keep URI references exact
- keep all critical warnings and constraints
- avoid removing important examples unless replaced by better ones
- preserve the compact/extended split

Also produce a short summary file:

`refactor-summary.md`

This summary must include:

1. what structural changes were made
2. what duplication was reduced
3. what safety-critical items were made more visible
4. what terminology was normalized
5. any places where ambiguity remained and why
```

## REFACTOR MCP SPEC CHECKLIST

```md
---
title: "Wenex MCP Refactor Checklist"
description: "Concise execution checklist for refactoring Wenex MCP specifications for AI-agent usability."
last-updated: "2026-04-26"
---

# Wenex MCP Refactor Checklist

Use this checklist while applying the refactor prompt.

## Preserve These Invariants

- `docs://readme` remains the routing entrypoint
- compact remains default
- extended never contradicts compact
- minimum startup sequence remains:
  1. `docs://core/specification`
  2. `docs://core/resource-specification`
  3. `docs://core/auth-specification` when auth-related behavior matters
- service docs stay on-demand by user intent
- agents must never guess protocol behavior
- code/runtime overrides prose on mismatch
- auth endpoints are not callable via MCP
- side-effect cautions remain intact

## Global Structure

For every file:

- [ ] frontmatter preserved
- [ ] version banner present
- [ ] purpose near top
- [ ] when-to-load near top
- [ ] AI Agent Quick Reference added
- [ ] Normative Rules separated from guidance
- [ ] section order standardized
- [ ] examples labeled and non-normative
- [ ] end marker preserved

## Compact vs Extended

### Compact
- [ ] shorter
- [ ] decision-critical facts first
- [ ] safety-critical rules retained
- [ ] minimal examples only
- [ ] points to extended when detail is needed

### Extended
- [ ] same knowledge as compact
- [ ] adds rationale and edge cases
- [ ] includes worked examples
- [ ] includes AI Agent Playbook
- [ ] explains serializer/write-only/platform-managed behavior

## Canonicalization

- [ ] APT lifecycle centralized in `docs://core/auth-specification`
- [ ] MCP operation/query/populate rules centralized in `docs://core/specification`
- [ ] service routing centralized in `docs://core/resource-specification`
- [ ] repeated concepts reduced in service docs
- [ ] source-of-truth precedence stated clearly

## Safety Visibility

- [ ] 401 vs 403 handling easy to scan
- [ ] OAuth scopes vs grant zones clearly distinguished
- [ ] zone default and AI-agent override clearly stated
- [ ] write-only fields clearly marked
- [ ] side-effect operations visually obvious
- [ ] append-only / no-update collections clearly marked
- [ ] auto-generated fields clearly marked
- [ ] raw-ID but non-populatable fields clearly marked

## Service-Specific Checks

### Auth
- [ ] cannot call auth endpoints directly
- [ ] scope vs grant distinction explicit
- [ ] subject/domain resolution explicit
- [ ] APT shown once rule visible
- [ ] APT update unsupported visible

### Financial
- [ ] `init_financial_transactions` recommended over `create`
- [ ] wallet private key write-only warning visible
- [ ] saga relationship visible

### Special
- [ ] file metadata vs upload distinction visible
- [ ] upload endpoints clearly documented
- [ ] share operation clearly documented

### Thing
- [ ] metrics immutable warning visible
- [ ] `device` write-only semantics visible
- [ ] count-before-pagination guidance visible

### Touch
- [ ] confirm recipient/content/channel before send
- [ ] real-world side effects obvious
- [ ] send operations clearly separated from records

### Essential
- [ ] backend-driven caution visible
- [ ] platform-managed saga fields visible

### Logistic
- [ ] `[longitude, latitude]` emphasized
- [ ] geocode/routing special ops structured clearly

## Table and Formatting Consistency

- [ ] stable field table format
- [ ] stable population table format
- [ ] stable scope table format
- [ ] stable special-operation format
- [ ] stable heading hierarchy
- [ ] consistent terminology

## Required Deliverables

- [ ] refactored markdown files in place
- [ ] `refactor-summary.md`
- [ ] no pull request
- [ ] no protocol behavior changes
- [ ] no contradictions introduced
```
