# DS-5478 / DS-2764 — Close interception API (canClose) for Sidepanel and Modal

Date: 2026-11-18
Tasks: DS-5478 (API + Sidepanel examples), DS-2764 (Modal examples)
Repository: angular-components

## Context

Create/edit forms are often opened inside a Sidepanel or Modal. Current state:

- **Sidepanel**: only `disableClose` exists, which fully blocks closing via backdrop/Escape. There is no way to show a "Close without saving?" confirmation dialog.
- **Modal**: closing can be cancelled only from `kbqOnOk`/`kbqOnCancel` (returning `false` or `Promise<false>`) — this covers footer buttons, but not mask clicks and Escape.

Goal: a unified close-guard API modeled after Angular's `CanDeactivate`, identical for both components. Plus documentation examples: for Modal — showcasing existing functionality, for Sidepanel — showcasing the new one.

## API contract

```ts
// shared types
export type KbqCloseReason = 'backdrop' | 'escape' | 'close' | 'programmatic';
export type KbqCanClose = (reason: KbqCloseReason) => boolean | Promise<boolean> | Observable<boolean>;
```

The types are declared in `@koobiq/components/core` (both packages already import from it, e.g. `ESCAPE`). No re-exports from `sidepanel` or `modal` — consumers import them from core.

### Sidepanel

- `KbqSidepanelConfig.canClose?: KbqCanClose` — set at open time.
- `KbqSidepanelRef.canClose?: KbqCanClose` — assignable property, can be set/replaced after opening. Takes precedence over the config: `ref.canClose ?? config.canClose`.

### Modal

- New config type:

```ts
// modal.type.ts
export interface KbqModalConfig<C = any, R = any> extends ModalOptions<C, R> {
    canClose?: KbqCanClose;
}
```

- `KbqModalService.open()` and `KbqModalRef` accept/store `KbqModalConfig`. Existing calls with `ModalOptions` remain valid (`canClose` is optional).
- `KbqModalRef.canClose?: KbqCanClose` — same as Sidepanel.

### Semantics

- Guard returns `true` → exit animation and dispose proceed. `false` → the component stays open, content state is untouched.
- Async results (`Promise`/`Observable`) are fully supported; while pending, repeated close triggers are ignored (internal `isGuarding` lock).
- Programmatic `ref.close()` also goes through the guard with `reason: 'programmatic'`; the guard itself decides whether to allow it (a typical guard immediately returns `true` for `'programmatic'`).
- No separate `forceClose()` is added: forced closing = remove the guard (`ref.canClose = () => true`) and call `close()`. The guard is always aware of a close attempt.

### Reason values

| reason           | Sidepanel                                       | Modal                               |
| ---------------- | ----------------------------------------------- | ----------------------------------- |
| `'backdrop'`     | backdrop click, outside click on the container  | mask click                          |
| `'escape'`       | Escape key                                      | Escape key                          |
| `'close'`        | indent area click, `kbq-sidepanel-close` button | X button, "Cancel" and "OK" buttons |
| `'programmatic'` | `ref.close()`                                   | `ref.close()`                       |

## Behavior table (identical for both components)

| Trigger               | no `canClose`                                        | guard → `true` | guard → `false`                          | guard pending                                                      |
| --------------------- | ---------------------------------------------------- | -------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| backdrop / Escape     | Closes (if the trigger is allowed by existing flags) | Closes         | Stays open                               | Repeated triggers are ignored; on resolve — same as `true`/`false` |
| X / indent / "Cancel" | Closes                                               | Closes         | Stays open, focus returns to the content | Same                                                               |
| `ref.close()`         | Closes                                               | Closes         | Stays open                               | Same                                                               |

Existing flags (`disableClose`, `kbqMaskClosable`, `kbqCloseByESC`) are evaluated before the guard and do not change: with `disableClose: true` the guard is not called for backdrop/Escape at all.

## Internal mechanics

### Sidepanel (`packages/components/sidepanel/sidepanel-ref.ts`)

- Currently all triggers converge in a single `merge(...)` in the constructor and call `close()`. Split the subscriptions, assigning each a reason (see the table above).
- New public method `requestClose(reason, result?)` on `KbqSidepanelRef` — the single entry point for every close attempt; public `close(result)` becomes `requestClose('programmatic', result)`. The actual closing (current body of `close`) moves to a private `doClose`, invoked only after the guard resolves `true`.
- The `kbq-sidepanel-close` directive calls `requestClose('close', value)` instead of `close(value)`, so the design-system close button does not bypass the guard the way `'programmatic'` typically does.
- Guard result resolution: `boolean` directly, `Promise` via `then`, `Observable` via `lastValueFrom`. The `isGuarding` flag is set while waiting.

### Modal (`packages/components/modal/modal.component.ts`, `modal-ref.class.ts`)

- Mask click and Escape consult `canClose('backdrop' | 'escape')` before the existing logic.
- X button and OK/Cancel keep the current `kbqOnOk`/`kbqOnCancel` mechanics; `canClose` with reason `'close'` works as an additional outer guard on top of it, without breaking the existing API.
- `KbqModalRef.close()` — reason `'programmatic'`, same result normalization and lock.

## Documentation examples (`packages/docs-examples`)

### DS-2764 — Modal (existing functionality)

- `modal-keep-open-on-error` — a password-change form; the "backend" (setTimeout stub) returns an error, `kbqOnOk` resolves `false` → the modal stays open, the form is not reset.
- `modal-button-loading` — footer buttons with `loading`/`autoLoading` driven by a Promise.
- Sections with text and `<!-- example(...) -->` in `examples.modal.ru.md` / `examples.modal.en.md`.

### DS-5478 — Sidepanel (new functionality)

- `sidepanel-can-close` — a form with a dirty check; on backdrop/Escape with unsaved changes — a confirmation modal with explicit actions "Close without saving" / "Keep editing" (no "Yes/No"); a pristine form closes without prompting.
- A "Close interception" section with the guard contract and the reason table in `sidepanel.ru.md` / `sidepanel.en.md`; a matching `canClose` section in `modal.ru.md` / `modal.en.md`.

## Tests

Jest specs next to the components:

- sidepanel (`sidepanel.spec.ts`): every reason reaches the guard; `false` keeps the panel open; repeated triggers during pending are ignored; `ref.canClose` overrides the config; `disableClose: true` does not invoke the guard.
- modal (`modal.spec.ts`): mask/Escape go through the guard; compatibility with `kbqOnOk → false` (both mechanisms cancel closing independently); `'programmatic'` via `ref.close()`.

## Backward compatibility and release steps

- No breaking changes: `canClose` is optional everywhere, existing behavior is preserved. `KbqModalConfig extends ModalOptions` keeps both directions assignable: existing `ModalOptions` objects are valid inputs, and the wider config type is assignable where `ModalOptions` is read.
- After implementation: `yarn run approve-api` to update `tools/public_api_guard` snapshots.
- RU and EN docs updated in sync.

## Affected files

- `packages/components/core/` — shared `KbqCanClose` / `KbqCloseReason` types
- `packages/components/sidepanel/`: `sidepanel-config.ts`, `sidepanel-ref.ts`, `sidepanel-directives.ts`, `sidepanel.spec.ts`, `sidepanel.{ru,en}.md`, `examples.sidepanel.{ru,en}.md`
- `packages/components/modal/`: `modal.type.ts`, `modal.component.ts`, `modal-ref.class.ts`, `modal.service.ts`, `modal.spec.ts`, `modal.{ru,en}.md`, `examples.modal.{ru,en}.md`
- `packages/docs-examples/components/sidepanel/sidepanel-can-close/`
- `packages/docs-examples/components/modal/modal-keep-open-on-error/`, `modal-button-loading/`
- `tools/public_api_guard/**` (API snapshots)
