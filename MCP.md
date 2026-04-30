# Powerful Prompt - [Github Copilot](https://github.com/copilot)

Refactor the attached `-specification.compact.md` and `-specification.extended.md` markdown files into final production-ready versions.

You must follow the attached `refactor-mcp-specs-prompt.md` and `refactor-mcp-specs-checklist.md` as governing instructions.

## Task Boundary

You must refactor **only** these two files:

- `-specification.compact.md`
- `-specification.extended.md`

Do not refactor any other files.

## Required Outcome

Produce final rewritten versions of both files so they are:

- safe for AI-agent assistance on the Wenex platform
- structurally consistent with the MCP documentation system
- deterministic to load and interpret
- explicit about normative vs explanatory content
- aligned with current source of truth from the attached repositories and files

## Required Sources of Truth

Use these implementation sources when refining or correcting the attached specification files:

### Repository sources

- `@wenex-org/platform`
  - use `apps/gateway/src` as the source of truth for:
    - externally visible endpoint/controller/resolver behavior
    - operation visibility
    - special-operation existence
    - runtime-exposed collection behavior

- `@wenex-org/platform-libs`
  - use enum directories/files as the source of truth for:
    - enum values
    - shared core types
    - shared constants where externally relevant
  - use `common/src/schemas/map.ts` as the source of truth for:
    - confirmed population paths

### Interpretation rule

Ignore internal-use methods, classes, and interfaces unless they directly define externally visible runtime behavior.

Do not use internal implementation detail as public protocol definition unless the external runtime surface clearly depends on it.

## Mandatory Source-of-Truth Precedence

When there is conflict or ambiguity, resolve it in this exact order:

1. runtime / gateway / externally visible behavior in `@wenex-org/platform`
2. schema / type definitions / enums / map definitions in `@wenex-org/platform-libs`
3. current attached markdown specification prose
4. examples

Do not violate this precedence.

## Mandatory Preservation Rules

You must preserve all valid knowledge already present in the attached files unless stronger source of truth requires refinement.

You must preserve:

- the compact vs extended split
- existing MCP semantics unless ambiguity requires clarification
- safety-critical warnings
- source-of-truth precedence
- Wenex MCP architectural assumptions from the attached docs
- compatibility with the attached refactor prompt and checklist

You must not introduce contradictions between compact and extended.

## Mandatory Refactor Rules

### For both files

You must ensure the final files contain, in a stable order:

1. frontmatter
2. version banner
3. purpose
4. when to load
5. what this doc contains / does not contain
6. AI Agent Quick Reference
7. Normative Rules
8. resource or collection index
9. operation model / tool patterns
10. schema reference
11. population rules
12. query rules
13. error / safety / side-effect rules
14. common patterns
15. examples
16. cross references
17. change sensitivity note
18. end marker

### For the compact file

You must make it:

- shorter than extended
- decision-first
- safety-first
- low-token
- limited to operationally necessary detail
- explicit about when extended is needed

### For the extended file

You must make it:

- semantically identical to compact
- fuller in rationale
- richer in worked examples
- clearer about edge cases
- stronger in AI-agent operational guidance

## Mandatory Content Rules

### Operations

If a special operation is mentioned or confirmed, document it using this exact structure:

- operation name
- tool name
- HTTP endpoint
- required scope
- returns
- input fields
- response notes
- example

Do not invent special operations not confirmed by runtime/controller surface.

### Enum values

Only include enum values confirmed by `@wenex-org/platform-libs` or clearly supported source of truth.

Do not guess enum values.

### Population

Only list population paths confirmed by `common/src/schemas/map.ts` or stronger runtime source of truth.

If a field is a MongoId-like reference but is not confirmed in the population map, label it as:

- raw ID
- not a confirmed population path

Do not describe it as populatable.

### Visibility and field behavior

If a field is:

- write-only
- serializer-hidden
- platform-managed
- raw-only
- response-limited

make that explicit in the final docs.

Do not expose hidden or write-only data in examples.

### Internal implementation details

Do not document internal-use methods, classes, or interfaces as public MCP behavior.

You may use them only when necessary to confirm externally visible behavior and only if that behavior is clearly surfaced through runtime endpoints/controllers/resolvers.

## Prohibited Actions

Do **not**:

- create a pull request
- propose a PR instead of doing the rewrite
- ask to defer the work
- invent undocumented behavior
- invent unsupported enum values
- invent unsupported population paths
- invent unsupported headers or tool names
- rely on internal-only abstractions as protocol surface
- remove safety warnings for brevity
- merge compact and extended into one file
- return partial edits or patch notes instead of full rewritten files

## Output Contract

Return exactly two complete markdown files in chat:

- `-specification.compact.md`
- `-specification.extended.md`

Each file must be fully rewritten and polished.

Do not return a summary instead of the files.
Do not return a PR description.
Do not return instructions for a future agent.

Return the actual final file contents.

**End of Strict Task Prompt.**
