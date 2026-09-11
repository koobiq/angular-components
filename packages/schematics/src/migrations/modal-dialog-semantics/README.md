# modal-dialog-semantics

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Reports what the modal review changed for consumers: the members that
disappeared or became protected, and the close controls that stopped being inert on the
declarative path. It never writes to the tree.

## Background

The dialog is a real dialog now, and its two entry paths behave the same.

| Member                                                                                                                                                                               | Before | After       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----------- |
| `transformOrigin`, `getKbqFooter()`, `getContainerClasses()`, `autoFocusedButtons`                                                                                                   | public | removed     |
| `ModalUtil`, `modalUtilObject`, `IClickPosition`                                                                                                                                     | public | removed     |
| `handleCloseResult`, `getButtonCallableProp`, `isModalType`, `isTemplateRef`, `isNonEmptyString`, `isComponent`, `isModalButtons`, `onClickMask`, `onClickOkCancel`, `onButtonClick` | public | `protected` |
| `maskAnimationClassMap`, `modalAnimationClassMap`                                                                                                                                    | public | `protected` |

`transformOrigin` deserves a note. It was recomputed on every open from the last document click
position, which starts at `{x: -1, y: -1}` and was never reset, and it was applied against keyframes
that end at `transform: scale(1)` — against which `transform-origin` is a no-op. Nothing it produced
was ever visible, and the document-wide click listener feeding it was registered at module load and
never removed.

## The behaviour changes

**`(kbqOnOk)` / `(kbqOnCancel)` close the dialog now.** `handleCloseResult` branched on the runtime
type of the trigger: an `EventEmitter` was emitted and the method returned. Both default to
emitters, and only `KbqModalService.create()` replaced them with closures — so on a declarative
`<kbq-modal [(kbqVisible)]>` the ×, the dim layer and the predefined OK/Cancel buttons emitted and
did nothing at all. The emitter form is a notification now; the veto lives on the callable form,
which keeps the dialog open by returning `false`.

**<kbd>Escape</kbd> has one implementation.** It honours `kbqCloseByESC` on both paths — a
declarative `[kbqCloseByESC]="false"` used to close anyway — and it routes through `kbqOnCancel`, so
a callback returning `false` vetoes it, which it could not do on the service path either.

**A service-created dialog is destroyed with its opener.** Its lifetime is bound to
`options.injector`, or to the root environment injector when none is passed. Destroying the opener
used to leave the dialog painted over the next view, with `afterClose` never emitting and the page
scroll still locked.

## What it does _not_ do

Nothing is rewritten. A removed member has no replacement expression, and whether a dialog should
still close where it used to stay open is a decision the schematic cannot make.

| Pattern                                                         | Manual migration                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `(kbqOnOk)` / `(kbqOnCancel)`                                   | Nothing, unless you relied on the dialog staying open — then pass a function that returns `false` |
| `.transformOrigin` / `.getKbqFooter()` / …                      | Delete the call; none of them produced anything a host could use                                  |
| `.handleCloseResult()` / `.isTemplateRef()` / …                 | Protected; use `open()`/`close()`/`destroy()`, `triggerOk()`, `triggerCancel()`                   |
| `ModalUtil` / `modalUtilObject`                                 | Delete the import                                                                                 |
| `.kbq-modal-open` / `--kbq-modal-size-close-button-margin-left` | Delete the rule; neither had a reader                                                             |

## Why the inputs are still decorators

Every other component in this review series ended on `input()`/`model()`. `KbqModalComponent` did
not, deliberately, and no consumer read needs an added `()`.

`ModalBuilderForService.changeProps` applies the whole options object with
`Object.assign(this.modalRef.instance, inputs)`. A signal input is a function held on the instance,
so a bulk assignment overwrites the `InputSignal` itself rather than writing through it — the
imperative path would have to be rewritten to a per-key `componentRef.setInput()`, with a runtime
allow-list standing in for the type checking `Object.assign` currently gets for free.

`kbqOnOk` and `kbqOnCancel` are the harder half: each is declared `@Input() @Output()` on one
property, holding either an `EventEmitter` or a callback, and branched on at runtime. There is no
signal shape for a member that is an input and an output at once, so splitting them is a second
breaking change to an API this migration has already changed the semantics of. Doing both at once
would leave consumers no working intermediate state.

`kbqVisible` is the one member that would collapse cleanly into `model()` — it is an accessor pair
with a matching `kbqVisibleChange` output — but it is written from `changeProps` like the rest, and
`ngOnChanges` on it is what drives `handleVisibleStateChange`. It moves when the two above do.

## Notes with no call site to point at

- The dialog carries `role="dialog"`, `aria-modal="true"` and an accessible name — `kbqTitle`, or
  the new `kbqAriaLabel` option when there is no title. A confirm or header-less dialog opened
  without `kbqAriaLabel` is announced unnamed.
- A manually composed dialog is named and described by its own `kbq-modal-title` and
  `kbq-modal-caption`, on the same `aria-labelledby`/`aria-describedby` attributes the service path
  uses, so the two entry paths announce alike.
- `kbq-modal-title` projects a `[kbqModalTitleActions]` slot, rendered beside the heading and
  outside its two-line clamp, for controls that belong next to the title rather than in the footer.
- While a dialog is shown, every body child that does not contain an overlay is marked `inert`, and
  so is every dialog below the topmost one. Code that reaches into the page behind an open dialog no
  longer takes effect.
- Initial focus follows the new `kbqAutoFocus` option (`'first-tabbable'` by default, plus
  `'dialog'`, `'first-heading'` and `false`), with `[cdkFocusInitial]`/`autofocus` winning over it.
- `kbqAfterOpen`/`kbqAfterClose` passed in the options are mirrored onto the dialog instead of
  replacing its own emitters, and a declarative modal no longer emits `kbqBeforeClose`/`kbqAfterClose`
  once on creation.
- The dialog is a flex column capped at the viewport minus `--kbq-modal-size-viewport-inset`, so only
  the body scrolls. A host that overrode the old `max-height: calc(100vh - 260px)` on
  `.kbq-modal-body` can drop that override.

## Running it manually

```
ng generate @koobiq/components:modal-dialog-semantics --project my-app
```
