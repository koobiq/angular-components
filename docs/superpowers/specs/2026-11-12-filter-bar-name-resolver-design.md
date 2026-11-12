# Filter bar stable name keys and reactive name resolution — DS-5764

## Status

Proposed on 2026-11-12 after a fresh evaluation of the signal-backed-name implementation in draft PR #2362.
This document supersedes the public API approach of `2026-11-11-filter-bar-signal-names-design.md` for the next implementation iteration. No product code is approved by this document until the human partner approves it.

## Intent

Let an application translate pipe names and built-in pipe value names at runtime without replacing `filter`, recreating pipes, or changing selected business values.

Keep localization at the rendering boundary. Filters, selected values, explicit snapshots, automatic state saving, and application-owned saved filters remain plain serializable data. The public API is independent of a translation library.

## What the current implementation shows

- `KbqPipeDirective` creates a pipe component once with a static `KBQ_PIPE_DATA` object. A replacement of the `*kbqPipe` input does not update that component, so labels must react inside the existing pipe views.
- A pipe `name` is also the legacy fallback identity through `getId()`. A date preset is selected by `name`; a select value carries its display `name` inside `filter.value`; tree selection already uses a separate stable `value`.
- The current draft widens all these names to `string | Signal<string>`. This makes labels reactive, but also puts function objects into business state. It consequently needs mandatory ids for new configurations, custom cloning, JSON projection, template-based rehydration, and a public serialization helper for application-owned saved filters.
- Widening `name` is source-incompatible for consumers that read it as a string, even though supplying a plain string still works.
- Renaming the signal to `displayName` does not remove the main problem: the selected option object would still carry the function into snapshots and saved filters.

## Goals

- Translate the name of every built-in pipe and the names of select/multiselect options, date/datetime presets, and tree/multi-tree nodes without rebuilding the filter or templates.
- Preserve selected values, search text, open panels, expansion, focus, filter identity, and changed/saved flags when a translation changes.
- Keep `KbqPipe.name`, `KbqSelectValue.name`, `KbqDateTimeValue.name`, and tree node `name` typed as strings.
- Preserve all current behavior for configurations that do not opt into translation keys.
- Keep automatic persistence, explicit `saveFilterState()` / `restoreFilterState()`, and application-owned saved filters serializable without a new serialization API.
- Support per-filter-bar and application/subtree-wide resolution.
- Cover visible labels, triggers, tooltips, ARIA text, live announcements, and search with one resolution rule.
- Document runtime translation in English and Russian with no locale-driven reconstruction of the filter.

## Non-goals

- Translating `KbqFilter.name`: a saved filter name is user data and remains a string.
- Translating option captions or arbitrary custom `valueTemplate` content. A custom template remains application-owned and can use the stable `nameKey` itself.
- Adding a dependency on Transloco, ngx-translate, Angular i18n, or another translation library.
- Supporting `Observable<string>`, `Promise<string>`, or asynchronous resolver results directly.
- Normalizing the existing public shape of `filter.value` to ids only. That is a separate major-version design.
- Making `KbqPipeDirective` generally reactive to replacement pipe data.
- Backfilling translation keys into business objects or emitting updated filters merely to add metadata.

## Anti-goals

- Putting signals, observables, translator functions, or per-locale dictionaries inside `KbqFilter`, `KbqPipe`, or selected values.
- Deriving identity from a translated label.
- Serializing the currently translated label as restoration metadata.
- Closing, reopening, or recreating a pipe to refresh labels.
- Emitting `filterChange`, `onChangePipe`, or setting `changed` because a label changed.
- Adding both a signal-backed `name` and the key-based API.

## Constraints

- Every built-in text consumer must use the same resolver; a template-only solution cannot serve search, ARIA, or announcements.
- A resolver is called synchronously in an Angular template, `computed`, or `effect` when its result must be reactive. Angular tracks signals read synchronously through nested function calls in those contexts.
- A DI-provided resolver has a stable function identity. It must close over a reactive translation source to update at runtime. An input resolver may either do the same or be replaced by the application.
- Pipe popups resolve through the existing element-injector/view-container chain. No second overlay-specific localization mechanism should be introduced.
- New public declarations need concrete types and JSDoc; public API, API-docs, typings, and documentation gates apply.
- Existing select comparison remains id-based, pipe identity remains `id ?? name`, date preset identity remains its stable string `name`, and tree identity remains `value`.

## Approaches considered

### 1. Signal-backed `name` — current draft, rejected for the next iteration

Use `name: string | Signal<string>` everywhere and add custom identity and persistence handling.

It offers a familiar per-label API and direct use of `translateSignal()`. In exchange, reactive functions become business data, snapshots cannot use ordinary `structuredClone`, JSON loses the signals, and restored values need current-template rehydration. It also widens a public property that consumers already read as a string.

### 2. Separate signal-backed `displayName` — rejected

Keep `name` stable and add a display-only signal. This reduces identity disruption but creates two competing names and still leaves a function in the selected option object. Persistence and explicit snapshots therefore retain the central problem of approach 1.

### 3. Stable `nameKey` plus a reactive resolver — chosen

Keep `name` as a stable string and fallback. Add an optional serializable `nameKey`, and resolve that key through a filter-bar input or a DI fallback only when producing text.

This is additive, preserves identity and persistence, supports centralized dictionaries and parameterized/contextual translations, and works with any translation library through a synchronous reactive adapter. Its cost is that consumers define stable keys and a resolver instead of creating one signal per label.

### 4. Stable `nameKey` plus a dictionary input — viable subset of the chosen approach

Accept a reactive `Record<string, string>` instead of a resolver function. It is simpler for flat dictionaries and makes reactivity explicit, but is less suitable for interpolation, pluralization, duration-derived labels, and context-sensitive keys. The resolver can wrap such a dictionary, so a second public input is unnecessary initially.

### 5. Normalize selected values to ids/business values — deferred to a major redesign

Store only stable business values in `filter.value`; keep labels exclusively in templates. This is the cleanest domain model and matches the `bindLabel`/`bindValue` and `optionLabel`/`optionValue` patterns used by other select libraries. It changes the public value shape, events, saved data, and consumer code, so it is too broad for this additive request.

### 6. Rebuild computed configurations and make pipe data reactive — rejected for this request

A consumer can rebuild plain-string configurations on every locale change while the directive updates existing pipe instances. This avoids functions in state, but still makes every consumer reproduce configuration and selection reconciliation. It also changes a broad internal contract rather than solving only localization.

### 7. Documentation-only/application-owned reconciliation — rejected as incomplete

This requires no library API, but leaves the original request's difficult state-preservation logic in every application.

### Other rejected forms

- `Observable<string>` names add subscription lifecycle costs and retain identity/serialization problems.
- `name: Record<locale, string>` is serializable but stores every translation in every selected value and couples data to the application's locale list.
- Custom templates alone cannot provide string labels to search, ARIA, tooltips, and announcements.
- Extending `KbqFilterBarLocaleConfiguration` with application-domain labels mixes a fixed library-owned locale schema with an unbounded application dictionary.

## Public API

### Translation keys

Add `nameKey?: string` to:

- `KbqPipe`, and therefore `KbqPipeTemplate`;
- `KbqSelectValue`;
- `KbqDateTimeValue`;
- `KbqTreeSelectNode` and `KbqTreeSelectFlatNode`.

`name` remains unchanged and is the fallback text. `nameKey` is stable business metadata, not a translated label. An absent or empty `nameKey` preserves current behavior and does not invoke a custom resolver.

A date/datetime preset keeps a stable nonempty `name` because the existing period-list selection uses it as identity. A custom `{ start, end }` range needs neither `name` nor `nameKey`.

No new id is required by this design. Existing applications may continue to use explicit pipe ids and the already-required select ids as before.

### Resolver contract

Add declarations equivalent to:

```ts
export type KbqFilterBarNameKind = 'pipe' | 'pipe-template' | 'select-option' | 'date-preset' | 'tree-node';

export interface KbqFilterBarNameContext {
    /** Stable key to translate. */
    readonly key: string;
    /** Stable untranslated/fallback name from the source object. */
    readonly fallback: string;
    /** What is being named. */
    readonly kind: KbqFilterBarNameKind;
    /** Runtime owner of the label, or the template offered in the add-pipe menu. */
    readonly pipe: KbqPipe | KbqPipeTemplate;
    /** Original application object; for a tree node this is the source node, not the flattened node. */
    readonly source: KbqPipe | KbqPipeTemplate | KbqSelectValue | KbqDateTimeValue | KbqTreeSelectNode;
}

export type KbqFilterBarNameResolver = (context: KbqFilterBarNameContext) => string | null | undefined;
```

For a `select-option`, `date-preset`, or `tree-node`, `pipe` is always the current added `KbqPipe` and `source` is the value or source tree node. For an added pipe's own label, `kind` is `'pipe'` and both `pipe` and `source` are that current `KbqPipe`. For an entry in the add-pipe menu, `kind` is `'pipe-template'` and both are its `KbqPipeTemplate`; no runtime pipe exists yet. The resolver can therefore distinguish available filter templates from active filter criteria without inspecting object shapes.

The context allows a flat dictionary lookup and also parameterized or derived labels. For example, a date resolver can derive a label from the preset's `start` using the active `DateFormatter` rather than maintaining a dictionary.

The resolver must be pure, synchronous, and reasonably cheap: it can run for many options during rendering and search. It must not write filter state or produce side effects. `null` and `undefined` mean "no translation" and fall back to `fallback`; an empty string is a valid resolver result. Resolver exceptions are application errors and are not swallowed.

### Input and DI fallback

Add to `KbqFilterBar`:

```ts
readonly nameResolver = input<KbqFilterBarNameResolver | null>(null);
```

Add `KBQ_FILTER_BAR_NAME_RESOLVER` with a default resolver that returns `context.fallback`, and a `kbqFilterBarNameResolverProvider(resolver)` utility following the repository's existing provider patterns.

Precedence is:

1. No nonempty `nameKey`: return `name` without invoking a custom resolver.
2. A non-null `[nameResolver]`: use it for every keyed label in that filter bar.
3. Otherwise, use the nearest `KBQ_FILTER_BAR_NAME_RESOLVER`.
4. A resolver result of `null` or `undefined`: use the source `name`.

The input replaces the DI resolver rather than chaining with it. A missing key in the input resolver does not fall through to DI; it falls back to `name`. This keeps ownership of a bar's translations predictable.

The internal effective-resolver accessor must not add a required member to the public structural `KbqFilterBarHost` test seam. If the host is used to reach the input, its added resolution member is optional and standalone/test pipes fall back to the DI/default resolver.

## Resolution and reactivity

The common resolution operation:

1. Read the source's `nameKey` and stable `name`.
2. For a restored pipe or selected select/date value without a key, optionally obtain the key from the matching current pipe template or its option as described under legacy state.
3. Return `name` immediately if there is no key.
4. Select the input resolver or DI resolver and invoke it with the context.
5. Use a non-null result, otherwise the stable `name`.
6. Do not mutate the source or emit any change event.

Built-in templates and computed searches call this operation synchronously. The effective input is read as a signal, and signals read inside the resolver are tracked by the enclosing template/computed/effect. A translation update therefore invalidates only the relevant views and derivations.

No per-key signal creation, subscription, caching, or memoization is added initially. Applications with expensive resolution can memoize inside their resolver without changing the component contract.

## Built-in pipes

### Common pipe labels

Resolve the pipe `name` in every built-in pipe template, `kbq-pipe-add`, input placeholder/ARIA text, tooltips, and the added-pipe live announcement. The announcement captures the resolved label when the add action occurs; a later locale change does not announce anything by itself.

Readonly, text, and input pipes use the same operation even though they have no option labels.

### Select and multiselect

- Resolve option names in option content, explicit `viewValue`, trigger text, and tooltips.
- When `nameKey` is in use, derive trigger text from the selected value's resolved name rather than depending on custom-template text. Without a key, preserve the existing custom-template trigger behavior.
- Search and highlighting use the resolved current name. Existing caption matching remains unchanged.
- Derived options track the query, pipe-template updates, the effective resolver, and every signal it reads. A translation can change search results without clearing the query or changing selection.
- Locked values, select-all behavior, custom comparators, and `selectedAllEqualsSelectedNothing` continue to use existing ids/comparators, never labels.
- A custom `valueTemplate` keeps its current context and owns arbitrary content. It can read `option.nameKey`; no second public resolver helper or new context field is required.

### Tree-select and multi-tree-select

- Carry `nameKey` from each source node to its flattened node.
- Resolve the source/current node name in `getViewValue()`, built-in node content, single-value triggers, tooltips, and type-ahead/search.
- Reapply the active tree filter when the effective translation signals change, using the existing flattened-data tracking approach where appropriate.
- Selection and ancestor expansion continue to compare `value`; a translation does not replace the data source or intentionally reset expansion.
- Custom tree templates continue to receive the original source node and can use its `nameKey` themselves.

### Date and datetime

- Resolve preset names in the trigger, tooltip, and period list.
- Keep period-list selection keyed by the existing stable string `name`; the translation key never becomes an identity.
- A selected custom range remains formatted from `start` and `end` and bypasses preset-name resolution.
- Interval errors and other library-owned locale strings continue through the existing locale configuration, not the application name resolver.

## Persistence and legacy state

### New keyed data

No persistence implementation changes are required for newly keyed data:

- `name` and `nameKey` survive `JSON.stringify` and `structuredClone` as strings.
- Automatic state saving keeps its current `KbqFilterBarState` shape: `{ id, value }` per pipe, with no additional `nameKey` field. Pipe metadata is rebuilt from the base filter or current pipe template as it is today. A pipe that can be added from the menu carries its key on the template; a programmatically supplied base/saved pipe carries it on that pipe definition.
- Explicit snapshots keep their current cloning semantics.
- Application-owned saved filters need no serialization helper.
- Restoration never uses a translated label as an identifier and never needs to recover a live translator function.
- A keyed selected value can be translated even when its option is temporarily or permanently absent from current templates.

### Values persisted before keys were introduced

An old persisted pipe or select/date value may have no `nameKey`. During text resolution only, the pipe may borrow a key from current metadata:

- A pipe label uses the current template with the same `getId()` and pipe type.
- A select/date value uses an option from that same pipe template only, matched by the existing stable identity (select id, date preset name). It never searches another pipe's options.
- Borrow only on exactly one match. Zero or duplicate matches leave the stored `name` untouched; duplicates must not make the label depend on array order.

The borrowed key changes only the resolver context's `key`; `context.pipe` and `context.source` still follow the rules above. This is a read-only metadata lookup: do not replace the business value, write the key back, or emit change events. If there is no confident match, render the stored `name` exactly as before. Legacy values whose old localized identity cannot be matched are not migrated heuristically.

## Documentation

Update the filter-bar overview and localization example in English and Russian:

- Create the filter and templates once with stable `name` and `nameKey` strings.
- Use a resolver backed by a `computed` translation dictionary (and document how a `translateObjectSignal`-style API can back the same resolver).
- Show both a DI-provided default resolver and a per-bar input override, including precedence and null-result fallback.
- Switch locale without replacing `filter` or `pipeTemplates` and without emitting filter changes.
- Cover select, multiselect, tree/multi-tree, and date/datetime, including search and a custom template that uses `option.nameKey`.
- State that the resolver is synchronous and must read a reactive translation source; a nonreactive `translate()` call alone does not trigger updates.
- Keep guidance for ordinary nonreactive application data separate from the new keyed path.
- Document that old unkeyed persisted values fall back to their stored name when no current-template match exists.

The saved-filters example should demonstrate ordinary JSON/`structuredClone` round trips without a special serialization helper.

## Migration from the current draft branch

The draft PR has not established a released API. For the next implementation iteration:

- Remove `KbqFilterBarName`, `kbqResolveFilterBarName`, `kbqFilterBarToSerializableFilter`, signal-specific id validation, and the added date-preset id requirement.
- Remove `filter-bar-value.ts` and all signal-specific clone/JSON/rehydration changes.
- Reuse and adapt the rendering/search coverage where it applies to key-based resolution.
- Replace signal-backed documentation data with stable `name`/`nameKey` data and a central resolver.
- Do not carry the previous draft's signal-name migration guide into the released documentation.

Existing consumers of the released string-based API need no migration.

## Verification

Add focused unit coverage to the existing filter-bar suites:

- Unkeyed configurations render and behave exactly as before; custom resolvers are not called for them.
- Input and DI resolution precedence, null/undefined fallback, empty-string results, and resolver context are correct for every name kind.
- Pipe labels update in triggers, tooltip/ARIA text, and the add-pipe announcement without filter/value replacement or change events.
- Select/multiselect labels, custom-template triggers, search, highlighting, locked values, select-all, and custom comparators survive translation changes.
- Single/multi tree labels, triggers, search, selection, and expansion survive translation changes.
- Date/datetime preset labels update while selected presets and custom ranges retain their behavior and identity.
- Open panels, focus, typed search, changed/saved flags, `filterChange`, and `onChangePipe` are not disturbed by a translation-only update.
- Automatic JSON persistence, explicit snapshots, and application saved-filter round trips contain only strings and restore keyed labels, including values missing from current options.
- Legacy unkeyed pipes and values borrow a current-template key only within the same pipe and exactly one existing-identity match; zero/duplicate matches retain the stored fallback.
- Automatic state keeps its `{ id, value }` pipe shape and restores pipe-level keys from the base filter or current template rather than adding a state field.
- A DI resolver and an input override both work through popup/overlay content and in standalone pipe test hosts.

Run the filter-bar unit specs, spec/e2e type checks, formatting/linting for touched files, component build, public API/typings/API-docs checks, and the required documentation generation checks. Exercise the localization example end-to-end with runtime locale changes and saved-state restoration. Add or update Playwright coverage only if the implementation exposes a rendering regression that unit tests cannot cover; no baseline-only visual change is expected.

## Builder decisions

The builder may choose the smallest internal helpers and file placement that implement this contract, reuse suitable rendering changes from the draft branch, and structure tests according to existing suites. The builder should not add a second dictionary input, a public custom-template resolver helper, new ids, observable support, or another public name type without further design discussion.

The exact internal method used to expose the effective resolver to pipes is left to the builder, provided it preserves the structural compatibility of `KbqFilterBarHost` and reactive tracking.

## Decisions made during design

- Use explicit `nameKey` fields rather than reinterpreting every existing `name` as a translation key.
- Keep `name` as stable fallback data, including in date presets where it remains the identity.
- Provide both an input and DI fallback, with the input taking precedence and no resolver chaining.
- Allow contextual and parameterized translation through one synchronous resolver rather than adding a dictionary-only API.
- Distinguish an active pipe (`pipe`) from an add-pipe menu entry (`pipe-template`); value contexts always reference the current runtime pipe.
- Preserve custom-template contexts rather than expanding the public API for them.
- Handle legacy unkeyed pipes and values through read-only current-template key lookup within the same pipe and only on a unique match, not data migration or rehydration.
- Keep automatic persisted pipe entries as `{ id, value }`; pipe-level keys come from the base filter or current template.
