# Powerful Prompt - [Github Copilot](https://github.com/copilot)

Refactor the attached `-specification.compact.md` and `-specification.extended.md` into final
production-ready versions using the attached prompt and checklist as governing instructions.

## Sources of Truth (precedence order)

1. `@wenex-org/platform` → `apps/gateway/src` (controllers, routers, resolvers — external surface only)
2. `@wenex-org/platform-libs` → enum files + `common/src/schemas/map.ts` (enums, types, population paths)
3. Existing spec prose
4. Examples

Ignore internal-only methods, classes, and interfaces unless they directly define externally visible runtime behavior.

## Content Rules

- Enums: only values confirmed by platform-libs enum files
- Population: only paths confirmed by `map.ts`; label others as "raw ID – not a confirmed population path"
- Operations: confirm existence via gateway controllers before documenting
- Mark fields as write-only / platform-managed / serializer-hidden where applicable; never expose them in examples
- Do not invent operations, enums, population paths, headers, or tool names not confirmed by runtime sources
- Do not remove safety warnings

## File Rules

- **Compact:** shorter, decision-first, safety-first, low-token; defer detail to extended
- **Extended:** semantically identical to compact, fuller rationale, richer examples, stronger agent guidance
- Do not merge the two files into one

## Output

Return both files fully rewritten in this chat. No pull request. No summaries. No partial edits.
