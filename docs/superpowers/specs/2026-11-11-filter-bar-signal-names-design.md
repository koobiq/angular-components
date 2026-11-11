# Filter bar signal-backed names — DS-5764

## Intent

Allow an application to localize pipe names and built-in pipe value names without replacing `filter` or `pipeTemplates`. Changing a translation signal updates the rendered text while preserving the selected values, search query, open panel, changed/saved flags and filter identity.

The API is independent of a translation library. Applications can derive signals from `KbqLocaleService`, Transloco, ngx-translate via `toSignal`, or their own state.

## Goals

- Accept a plain string or an Angular `Signal<string>` as the display name of every built-in pipe and every built-in option/value type.
- Update triggers, panels, tooltips, ARIA labels, announcements and search when a name signal changes.
- Keep business values and selection stable by comparing stable identifiers rather than translated text.
- Keep automatic state saving and the explicit `saveFilterState()` / `restoreFilterState()` APIs working with signal-backed values.
- Preserve all existing behavior for string names, including the legacy fallback from a pipe's `name` to its identity.
- Document runtime translation with an example that creates its filter and templates once and does not rebuild them on locale changes.

## Non-goals

- Translating `KbqFilter.name`: a saved filter name is user data and remains a string.
- Translating option captions or arbitrary custom value-template content. A custom template can resolve the new signal-backed `name` itself.
- Adding a dependency on a translation library or introducing translation keys into the component.
- Changing the public shape of `KbqFilterBarState` or the business payload held in `value`.
- Supporting `Observable<string>` directly; consumers convert streams to signals at their boundary.

## Anti-goals

- Rebuilding `filter`, its pipes, or all templates when a translation changes.
- Emitting `filterChange`, `onChangePipe`, or marking a filter changed solely because a label changed.
- Deriving identity from a translated string or closing/reopening a panel to refresh its labels.
- Silently serializing a signal function into saved state.

## Constraints

- `*kbqPipe` creates a pipe component once and does not react to replacement of its `*kbqPipe` input object. Reactive name resolution therefore has to happen inside the existing pipe views.
- `KbqPipe.name` is currently also the fallback identity through `getId()`. A translated string cannot serve that role.
- Select values currently carry their display `name` inside `filter.value`, while automatic persistence uses JSON and explicit snapshots use `structuredClone`; neither can preserve a signal as data.
- Date presets currently use `name` as the list-selection value, so translating a name would otherwise change selection semantics.
- Tree selection already uses node `value` as its stable identity. Its flattened node and `getViewValue()` must retain and resolve the name signal rather than eagerly copying a translated string.
- All new public declarations need concrete types and JSDoc. The public API snapshots, docs metadata and generated agent documentation must be updated through the repository's normal gates.

## Approaches

### Chosen: `name: string | Signal<string>`

Introduce a public `KbqFilterBarName` union and use it for:

- `KbqPipe.name` and therefore `KbqPipeTemplate.name`;
- `KbqSelectValue.name`;
- `KbqDateTimeValue.name`;
- `KbqTreeSelectNode.name` and `KbqTreeSelectFlatNode.name`.

Add an exported `kbqResolveFilterBarName(name: KbqFilterBarName): string` helper. It returns a string unchanged or reads the signal. Built-in templates use the helper so signal reads are tracked by the consuming Angular view. The helper is public because custom `valueTemplate` implementations also need to render the union.

This gives consumers one familiar field and one resolution rule. The cost is explicit identifier and persistence work described below.

### Rejected: separate `displayName: Signal<string>`

Keeping `name` as a stable string and adding a second display-only field would reduce changes to identity and persistence. It was rejected because two overlapping name fields are harder to understand and make it unclear which field custom templates, search and saved values should use.

### Rejected: application-side computed configuration only

A consumer can already rebuild computed templates and remap selected values itself. That does not satisfy the request for a simple API and makes every consumer reproduce the same state-preservation logic.

## Identity

- A pipe with a signal-backed `name` must declare a stable `id: string | number`.
- A select or multiselect option with a signal-backed `name` must declare a stable `id`; the existing default `compareByValue` then retains selection across translations and restored object identities.
- Add `id?: string | number` to `KbqDateTimeValue`. A signal-backed preset name requires it. Date list selection and matching use this id instead of the translated name. String-only presets retain their current behavior.
- Tree nodes continue to use `value` for selection and expansion; no additional node id is required.
- `getId()` keeps the legacy `id ?? name` behavior for string-named pipes. A signal-named pipe without an id is an invalid configuration and produces an explicit error rather than an unstable or non-serializable identity.

The documentation states these id requirements next to the new name type and in the localization example.

## Rendering and reactivity

- Resolve pipe names in every built-in pipe template, `kbq-pipe-add`, the input placeholder/ARIA label, date popover labels, tooltips and the added-pipe live announcement.
- Resolve select option names in option content and `viewValue`, so `KbqSelect.triggerValue` continues to read the selected option's current label. Existing option `stateChanges` handling refreshes the trigger when the resolved label changes.
- Resolve date preset names in the trigger and list. A selected custom range remains formatted from its dates and is unaffected.
- Carry the name union into flattened tree nodes. Resolve it in `treeControl.getViewValue()` and in the single/multi tree trigger instead of reading a flattened `name` as a string.
- Keep custom value-template context unchanged apart from the widened `name` type. The localization documentation shows `kbqResolveFilterBarName` for custom templates that need the default label behavior.
- No name resolution happens in a non-reactive one-time initializer when the result is expected to update later.

## Search and open panels

- Flat select search matches the current resolved name and existing caption behavior. Its derived options react to the query, template changes and every resolved option-name signal, so a translation can change the current search results without clearing the query.
- Tree search uses resolved view values. A name-signal change reapplies the current tree filter without changing expansion rules beyond the existing search behavior.
- Existing filtered selections remain selected by id/value even when their translated label no longer matches the current query.
- Open panels remain open. Focus, active option, scroll position and typed search text are not intentionally reset by a translation update.

## Selection and change semantics

- Selecting an option continues to commit the option object to `filter.value`; no separate display-only value is introduced.
- A translation update does not replace the filter, pipe or value object and does not emit change events.
- Multiselect locked values, select-all behavior and `selectedAllEqualsSelectedNothing` continue to compare ids/values rather than labels.
- Date presets use stable ids for list selection where supplied; string-only presets keep the legacy name-based behavior.
- Tree selection and ancestor expansion continue to compare node values.

## Persistence and restoration

### Automatic state saving

Before writing `KbqFilterBarState`, project built-in select/multiselect/date values containing signal-backed names into JSON-safe values with the name resolved to its current string. Stable ids and business payloads are preserved.

When restoring, rehydrate those persisted values from the current pipe template:

- select: replace a persisted value with the current option having the same id;
- multiselect: rehydrate each entry by id and retain the existing locked-value normalization;
- date/datetime: replace a persisted preset with the current preset having the same id; custom start/end ranges pass through unchanged;
- tree values pass through unchanged because their labels live in the template nodes rather than in the selected business value.

If a matching current option is absent, retain the persisted business value rather than dropping the user's selection. Once options arrive later, the existing option comparison/reconciliation can associate it with the current label.

### Explicit in-memory snapshots

`saveFilterState()` and `restoreFilterState()` support the built-in signal-backed values. Snapshot cloning preserves a name signal as an immutable reference while cloning the surrounding built-in value structures; it does not call `structuredClone` directly on a signal.

Restoring an explicit snapshot applies the same template-based rehydration as automatic restoration where current templates are available. Existing restrictions for arbitrary custom non-cloneable value payloads remain unchanged.

No persisted or restored label is used as a stable identifier.

### Application-owned saved filters

A saved filter selected through `<kbq-filters>` must also recover its current signal-backed labels after the application has stored it through JSON or `structuredClone`. Add `kbqFilterBarToSerializableFilter(filter: KbqFilter): KbqFilter`, which returns a copy with every signal-backed pipe/value name resolved to its current string. Applications call it before their own JSON serialization or `structuredClone`; calling raw `structuredClone` on the live signal-bearing filter remains unsupported because JavaScript rejects function values before the component can participate.

Rehydrate the saved filter's built-in select/multiselect/date values from current `pipeTemplates` by stable id when `KbqFilters.selectFilter` accepts it, using the same matching rules as the built-in restoration paths. Do not require applications to retain live signal references in their own storage.

Update the saved-filters example and its documentation to show this supported round trip, including the serialization helper. A missing current option still leaves the persisted business value intact.

### Review resolutions

- Validate the required pipe id lazily but centrally in `getId()`: a signal-backed pipe name without an id throws a descriptive error in all builds. This prevents function objects from reaching `openPipe`, template matching or `KbqFilterBarState.id`. The same rule applies when select/date code resolves a signal-backed value identity.
- Use the same signal-aware built-in value cloning for `KbqPipeAdd.filterTemplate` as for explicit snapshots, so adding the first pipe cannot throw `DataCloneError` merely because an existing pipe name or value contains a signal.
- Keep the shared `localized-data.ts` helper unchanged. The localization example owns its signal-backed periods and stable ids, avoiding unrelated changes to other examples.

## Documentation example

Update `filter-bar-localization` and both English/Russian overview pages:

- construct stable pipe ids and option/preset ids once;
- define labels as `computed(() => ...)` from the active locale;
- switch locale through `KbqLocaleService.setLocale()` without replacing `filter` or `pipeTemplates`;
- show selected values surviving a language switch for select, multiselect, tree-select/multi-tree-select and date/datetime;
- show search and custom value-template resolution where relevant;
- remove the current guidance that runtime localization requires rebuilding the filter for signal-backed names, while retaining guidance for ordinary non-reactive application data.

The documentation makes clear that resolving a signal is a view update, not a filter-data change.

## Verification

Add focused unit coverage to the existing filter-bar suites:

- string names retain current behavior;
- signal-backed pipe names update trigger text, tooltip/ARIA text and add-pipe announcement;
- select and multiselect selected labels update without value/filter replacement or change events;
- flat search follows translated names and preserves the current query and selection;
- single/multi tree labels, triggers and search update while selection and expansion state survive;
- date/datetime preset labels update while the selected preset and custom ranges survive;
- dynamic-name configurations without required stable ids fail explicitly;
- automatic JSON persistence contains no signal functions and restoration rehydrates current labels by id;
- explicit save/restore snapshots support built-in signal-backed values;
- no regressions in locked values, select-all, custom comparators or custom value templates.

Run the filter-bar unit specs, spec type checking, formatting/linting for touched files, component build and public API guards. Regenerate and check documentation/API artifacts required by the changed JSDoc and MDX pages. No visual baseline change is expected; visual tests are needed only if implementation reveals a rendering regression.

## Builder decisions

The implementation may choose the smallest internal reactive primitives that satisfy these behaviors, and may place internal persistence/rehydration helpers in separate files. The approved public additions are the name union, resolver, date preset id and serializable-filter helper; do not broaden the API further without a design discussion.
