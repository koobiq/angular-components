# Proposal

## Why

`kbqLink` is used on its own and inside other components (file-upload, clamped-text, time-range), and what it promises consumers is spread across `link.ts`, its unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later link changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `link` capability: the observable behaviour of the `kbqLink` component and the `kbqLinkPrefix` and `kbqLinkSuffix` directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover regular and pseudo links, the content structure and the trimmed text, sizes, the external icon, keyboard activation and the hosts that keep their own semantics, printing, focus and the tab order, wrapping, the underline modes, visited links, the disabled state, the application-wide defaults, right-to-left layout and accessibility.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `link`: the behaviour contract of `kbqLink`, `kbqLinkPrefix`, `kbqLinkSuffix`, `kbqLinkOptionsProvider` and `KBQ_LINK_OPTIONS` in `@koobiq/components/link` — what a consumer can rely on when they put a link or a pseudo link into a page and a user operates it with the mouse, the keyboard, assistive technology or a printer.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-link-baseline/` now, and `openspec/specs/link/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the ones that render a link inside them; the deprecated `kbq-link` directive in `@koobiq/components/link/deprecated`; visual styling and design tokens beyond what a consumer selects through an input; internals.
- From then on, a change that alters link behaviour updates this spec through a `MODIFIED` delta.
