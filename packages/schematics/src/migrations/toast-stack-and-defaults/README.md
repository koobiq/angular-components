# toast-stack-and-defaults

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the breaking parts of the toast review.

This schematic is report-only: it never writes a file. Every change below needs
a decision a schematic cannot make for you.

## Background

`KbqToastComponent` used to hold `readonly service = inject(KbqToastService)`
and reach the whole service through it. It now resolves only the narrow
`KbqToastStack` contract it actually consumes, through the new
`KBQ_TOAST_STACK` token, which both `KbqToastService` and
`KbqToastContainerComponent` provide.

## Breaking changes

**`KbqToastComponent.service` is gone**, and so are the members that only
existed for the old rendering path: `elementRef`, `ttl`, `delay`,
`isTemplateRef()`, `themePalette` and `toastStyle`. Everything the template
renders — `style`, `icon`, `role`, `closeButton` and the resolved slot templates
— became `protected`. `data`, `id`, `hovered`, `focused`, `animationState`,
`close()` and `onAnimation()` are still public.

A subclass registered through `KBQ_TOAST_FACTORY` is the documented extension
point, so it is the code most likely to break:

```ts
// Before
class MyToast extends KbqToastComponent {
    ok() {
        this.service.hide(this.id);
    }
}

// After
class MyToast extends KbqToastComponent {
    ok() {
        this.close();
    }
}
```

Anything the stack contract does not cover is reached by injecting it directly:

```ts
class MyToast extends KbqToastComponent {
    private readonly stack = inject(KBQ_TOAST_STACK);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
}
```

The countdown moved into the service, so there is no per-instance `ttl` or
`delay` to read or write any more — pass the lifetime as the `duration`
argument of `show()`.

**`KbqToastService.animation` is a `Subject<AnimationEvent>`**, not a
`BehaviorSubject<AnimationEvent | null>`. `.getValue()` and `.value` no longer
exist and nothing is replayed to a late subscriber.

**`showTemplate()` and `templates` return
`EmbeddedViewRef<KbqToastTemplateContext>`**, whose `$implicit` is the
`KbqToastData` — not the toast component. Only annotations of the returned ref
need adjusting; the value has always been the embedded view.

**A `KBQ_TOAST_FACTORY` component that does not extend `KbqToastComponent`** is
rejected: `show()` reads the numeric `id` the service keys its stack by, and
throws when it is missing instead of stacking a toast it can never dismiss.

## Behaviour changes

**The data you pass in is no longer written to.** `show()` used to default
`style` to `contrast` and `icon` to `true` by assigning them onto the caller's
object; both defaults are resolved inside the toast now. Anything that read
those keys back after `show()` — or rendered the same object somewhere else,
which is what `kbq-notification-center` does — has to apply its own defaults.

**Auto-dismissal pauses while a toast is hovered or holds the focus.** The
whole stack shares one heartbeat, which stops while the stack is empty. A toast
shown through `showTemplate()` carries no such listeners and is not paused.

**Every toast is a live region:** `role="alert"` for the error and warning
styles, `role="status"` otherwise. The stack itself is a labelled
`role="region"` whose name comes from the new `toastRegion` key of the `a11y`
section of the locale data.

**Focus is handed on only for a keyboard dismissal** — to the next toast, or
back to the element that held it when the toast appeared. A mouse dismissal
leaves the focus where the browser put it.

## Running the migration

```bash
ng update @koobiq/components@20
```

Or manually:

```bash
ng g @koobiq/components:toast-stack-and-defaults --project <your project>
```
