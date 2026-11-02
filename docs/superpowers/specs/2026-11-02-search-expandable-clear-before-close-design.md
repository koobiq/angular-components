# Search Expandable: clear before close

## Intent

DS-5274 changes the expanded search suffix from an unconditional close action into a clear-or-close action. The user must be able to clear a query without losing the expanded field or their place in it.

## Goals

- Activating the suffix with a non-empty value clears the field and the bound form control, keeps the component expanded, and focuses the input.
- Activating the suffix with an empty value collapses the component and moves focus to the collapsed button through the existing focus handoff.
- Closing by any existing path clears the value, so a later open starts empty.
- The suffix accessible name is `clear` while non-empty and `close` while empty.

## Non-goals

- Do not change `Escape`: it continues to collapse and clear immediately.
- Do not change the public `toggle(): void` behavior or any published API.
- Do not change `defaultValue`, `defaultEmitValueTimeout`, the visual design, or screenshot baselines.

## Constraints

- Use the existing `value` signal, internal `FormControl<string>`, `cancelPendingEmit`, and `emitValue` pipeline.
- Clearing must cancel a pending debounced value and synchronize the bound control immediately, including when `isEmitValueByEnterEnabled` is enabled.
- Emptiness means the exact empty string `''`; do not trim user input.
- Keep component documentation in English and Russian.

## Approaches

1. **Dedicated suffix handler, chosen.** Add an internal template handler that clears a non-empty value or toggles an empty one. Extract the existing close-time reset into a shared private method. This leaves `Escape` and `toggle()` untouched.
2. Change `toggle()` itself. Rejected because it also changes `Escape` and the public method's behavior.
3. Compose `KbqCleaner` with a separate close action. Rejected because adapting its reset semantics and adding another action is more complex than reusing the component's existing reset pipeline.

## Implementation decisions

- Add `protected onSuffixClick(): void`, hidden from published typings with `@internal`, and bind it from the suffix button.
- Add `private resetValue(): void`; use it both for suffix clearing and in `setOpened(false)`.
- After a suffix clear, synchronously call `focus()` on the rendered `KbqInput`, matching the existing cleaner pattern.
- Bind the suffix `aria-label` from `value()` and the existing localized `a11y.clear` / `a11y.close` strings.

## Verification

Cover non-empty clearing, empty closing, focus, immediate model synchronization, pending debounce cancellation, Enter-only emission mode, accessible names, unchanged `Escape`/`toggle()`, and a two-click Playwright scenario. Update both overview pages with the clear-or-close behavior.
