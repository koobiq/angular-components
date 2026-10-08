# modal-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Rewrites reads of the `KbqModalComponent` members that became signals
into calls, and reports the two renames and the reads it cannot resolve.

Runs alongside [`modal-dialog-semantics`](../modal-dialog-semantics/README.md), which covers the
behaviour and visibility changes of the same review. This one covers only the move to signals.

## Background

Two things kept the dialog on decorator inputs while the rest of the review series moved to
`input()`.

`ModalBuilderForService` applied the whole options object with
`Object.assign(this.modalRef.instance, inputs)`. A bulk assignment overwrites an `InputSignal`
instead of writing through it, so every option would have broken at once. The options are provided
as `KBQ_MODAL_OPTIONS` now, and the dialog reads them as the **initial values** of its inputs: a
dialog created by the service carries no template bindings, so an input it does not bind keeps that
initial value for life. That also removed the four `if (!('x' in options))` blocks in
`KbqModalService.create()`, which only existed to make `Object.assign` overwrite a default.

`kbqOnOk` and `kbqOnCancel` were each `@Input()` **and** `@Output()` on one property. A signal input
and an output cannot share a name, so the pair had to be split first — see
[`modal-dialog-semantics`](../modal-dialog-semantics/README.md) for that half.

## What it rewrites

A read of a migrated member becomes a call, on receivers the engine can resolve: a variable or
field annotated `KbqModalComponent`, an `inject()`/`viewChild()`/`contentChild()` of it, and a
`#ref` on a `<kbq-modal>` element in an external or inline template. A write to `kbqVisible` becomes
`kbqVisible.set(...)`, because it is the one `model()`.

| Call site                      | Becomes                                             |
| ------------------------------ | --------------------------------------------------- |
| `modal.kbqVisible`             | `modal.kbqVisible()`                                |
| `modal.kbqVisible = true`      | `modal.kbqVisible.set(true)`                        |
| `modal.kbqTitle`, `kbqSize`, … | `modal.kbqTitle()`, `modal.kbqSize()`, …            |
| `modal.kbqTitle = 'x'`         | Reported — bind `[kbqTitle]`; the input is readonly |

## What it reports instead

- **`kbqOnOk:` / `kbqOnCancel:` as a key.** The decision handler is `kbqOkClick`/`kbqCancelClick`
  now, but `kbqOnOk` survives as an output under the same name, so the key has to be judged in
  context: an options object and an `[kbqOnOk]` input binding move, a `(kbqOnOk)` listener does not.
  `ModalOptions.kbqOnOk` is an `EventEmitter` now, so a function left under the old key is a compile
  error rather than a silent change of meaning.
- **`[kbqOnOk]` / `[kbqOnCancel]` input bindings.** The old names are outputs only, so Angular would
  drop the binding silently.
- **Reads through `KbqModalRef.getInstance()`.** The ref is what `KbqModalService` returns and its
  static type carries none of these members, so the engine has nothing to resolve the receiver to.
- **`okText` / `cancelText`.** Removed. They were getters returning `kbqOkText`/`kbqCancelText`
  unchanged and existed only to feed the template.
- **The four template type guards** — `isTemplateRef`, `isNonEmptyString`, `isComponent`,
  `isModalButtons`. Removed; the template classifies each slot once instead. They were already
  `protected` and `@docs-private`, so only a subclass is affected.

## Notes with no call site to point at

- `kbqOkLoading`, `kbqCancelLoading` and `kbqMask` keep a private writable shadow inside the dialog,
  because something other than the binding drives them: a pending promise returned by a handler, and
  a dialog that covers this one. The inputs keep reporting what was bound, so re-binding one still
  takes effect.
- The predefined OK and Cancel buttons finally render the progress state `kbqOkLoading` and
  `kbqCancelLoading` always described. The template never read them before, so a promise-returning
  handler showed nothing.
- `kbqFooter` is no longer overwritten with its own formatted copy on init, so it reports exactly
  what was bound; the button defaults are filled in on the way to the template.
- `KbqModalComponent` no longer declares `implements ModalOptions`. That interface is the service's
  contract, and the component's inputs are signals, so the two no longer match structurally.
- `KbqModalControlService` still turns the dim layer of covered dialogs off and back on from
  outside, through `animateMaskTo()` and the new `setMaskEnabled()`. That orchestration belongs in
  the dialog, keyed on `topVisibleModal()` the way `inert` already is, and has not moved yet.
- `kbqAfterOpen`, `kbqAfterClose` and `kbqBeforeClose` are still `@Output() EventEmitter`. They back
  the public `afterOpen`/`beforeClose`/`afterClose` observables, and `output()` is not a drop-in:
  `OutputEmitterRef` has no `asObservable()`, and `outputToObservable()` completes the stream when
  the component is destroyed — which happens inside the emit itself, because
  `ModalBuilderForService` subscribes first to dispose the overlay, so the value is dropped before
  it reaches a consumer's `afterClose`. Converting them means moving the source of truth to a
  `Subject` the dialog owns and taking the overlay teardown off that emitter.

## Running it manually

```
ng generate @koobiq/components:modal-signals --project my-app
```

Pass `--fix=false` to see what would change without writing.
