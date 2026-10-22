# Proposal

## Why

The baseline spec of `markdown` states behaviour the code does not have. A static audit of `openspec/specs/markdown/spec.md` against `packages/components/markdown` on `c9c196a9b` found six requirements whose wording the source, the parser it calls or the unit snapshots contradict; this change corrects them so the spec describes what ships.

## What Changes

- **Projected content is read as plain text**: without preserved whitespace the Angular compiler collapses every run of two or more whitespace characters into one space, so a lone newline survives; the spec claimed that no line structure survives.
- **Default parser options**: the component parses with the defaults of the global `marked` instance, which `marked.use()` or `marked.setOptions()` elsewhere in the application changes; GitHub Flavored Markdown and the missing line break hold only while those defaults are unchanged.
- **HTML in the Markdown is not sanitized**: the attributes of raw HTML do not all reach the DOM as `marked` passes them through; the alias class shadows the own `class` attribute of an element of a listed tag other than `p` and `th`.
- **Tables**: header cells of aligned columns have no `kbq-markdown__th` class; the requirement claimed that every header cell has it.
- **Line break with two trailing spaces**: two trailing spaces give a `br` only when another line of the same paragraph follows, and spaces written as `&#32;&#32;` in projected content survive only where the template keeps whitespace.
- **Parsing service**: `parseToHtml` returns a string only for synchronous parsing; with `async` on, in the options or on the global `marked` instance, it throws a `TypeError`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `markdown`: corrects the requirements "Projected content is read as plain text", "Default parser options", "HTML in the Markdown is not sanitized", "Tables", "Line break with two trailing spaces" and "Parsing service".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-markdown-baseline/` and, once archived, `openspec/specs/markdown/spec.md`. No source, test, documentation or public API changes.
