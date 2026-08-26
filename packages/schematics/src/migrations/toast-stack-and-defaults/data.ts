/**
 * Warning data for the toast review.
 *
 * `KbqToastComponent` stopped depending on the concrete `KbqToastService` and resolves its stack through
 * the new `KBQ_TOAST_STACK` token instead, which removed `service` together with the members a subclass
 * used to reach through it. Everything the template renders became `protected`, `KbqToastService.animation`
 * was narrowed from a `BehaviorSubject` to a plain `Subject`, and `showTemplate` / `templates` now carry the
 * template context type instead of the toast component type.
 *
 * None of it can be rewritten mechanically — a subclass has to be rewired by hand — so every pattern below
 * reports and nothing is auto-fixed.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** Warnings for `.ts` files. */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: 'extends\\s+KbqToastComponent\\b',
        message:
            'KbqToastComponent no longer exposes `service`, `elementRef`, `ttl`, `delay`, `isTemplateRef()`, ' +
            '`themePalette` or `toastStyle`, and everything the template renders is now protected. A subclass ' +
            'that dismissed itself through `this.service.hide(this.id)` should call `this.close()`, or inject ' +
            'the stack itself: `private readonly stack = inject(KBQ_TOAST_STACK)`. Use `inject(ElementRef)` for ' +
            'the host element, and read the remaining lifetime from your own state — the countdown lives in the ' +
            'service now. Manual migration required.'
    },
    {
        pattern: 'KBQ_TOAST_FACTORY',
        message:
            'A component provided through KBQ_TOAST_FACTORY must extend KbqToastComponent: the service reads ' +
            'its numeric `id` and now throws when it is missing instead of stacking an unusable toast. The ' +
            'component also resolves KBQ_TOAST_STACK, which KbqToastService and KbqToastContainerComponent ' +
            'both provide — nothing has to be wired up by hand.'
    },
    {
        pattern: '\\banimation\\s*\\.\\s*(?:getValue\\s*\\(|value\\b)',
        message:
            'KbqToastService.animation is a plain Subject<AnimationEvent> now, not a ' +
            'BehaviorSubject<AnimationEvent | null>, so `.getValue()` and `.value` are gone and nothing is ' +
            'replayed to a late subscriber. Subscribe to the stream instead.'
    },
    {
        pattern: '\\.instance\\s*\\.\\s*(?:ttl|delay|toastStyle|themePalette|isTemplateRef|elementRef|service)\\b',
        message:
            'This member was removed from KbqToastComponent, so reads through `KbqToastService.toasts[i].instance` ' +
            'no longer compile. The lifetime of a toast is owned by the service — pass it as the `duration` ' +
            'argument of `show()` — and the host element is available as `toasts[i].location.nativeElement`.'
    },
    {
        pattern: '\\bshowTemplate\\s*\\(',
        message:
            'showTemplate() and the `templates` getter return EmbeddedViewRef<KbqToastTemplateContext> now, not ' +
            'an EmbeddedViewRef of the toast component: the context of a template shown this way carries the ' +
            'KbqToastData as `$implicit`. Adjust the type argument wherever the returned ref is annotated.'
    }
];

/** Warnings for `.html` files and inline templates. */
export const templateWarnPatterns: WarnPattern[] = [
    {
        pattern: '<kbq-toast\\b(?!-)',
        message:
            'Everything KbqToastComponent renders — `style`, `icon`, `role`, `closeButton` and the resolved slot ' +
            'templates — became protected, so a template reference variable on <kbq-toast> can no longer read ' +
            'them. `data`, `id`, `hovered`, `focused`, `animationState` and `close()` are still public.'
    }
];

/** Behaviour note printed once per run — the parts no call site can point at. */
export const BEHAVIOUR_NOTE = [
    'Toast behaviour changed:',
    '  - The data passed to show() / showTemplate() is no longer written to. `style` used to be defaulted to',
    '    "contrast" and `icon` to true on the caller\'s object; both defaults are now resolved inside the toast.',
    '    Anything that read those keys back after show() — or rendered the same object somewhere else, the way',
    '    kbq-notification-center does — has to apply its own defaults.',
    '  - Auto-dismissal is paused while a toast is hovered or holds the focus, and the countdown of the whole',
    '    stack is driven by one heartbeat that stops while the stack is empty. A toast shown through',
    '    showTemplate() carries no such listeners and is not paused.',
    '  - Every toast is a live region: role="alert" for the error and warning styles, role="status" otherwise.',
    '    The stack itself is a labelled role="region", whose name comes from the new `toastRegion` key of the',
    '    a11y section of the locale data.',
    '  - Dismissing a toast with the keyboard hands the focus on to the next toast, or back to the element that',
    '    held it when the toast appeared. A mouse dismissal leaves the focus where the browser put it.'
];
