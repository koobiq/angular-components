import { _IdGenerator } from '@angular/cdk/a11y';
import { computed, Directive, inject, input, model, numberAttribute } from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqClamped, KbqClampedRoot, kbqInjectClampedTextLocaleConfiguration } from './constants';

/**
 * Renders a long list compactly: keeps the first `collapsedVisibleCount` items and lets a projected
 * `kbqClampedListTrigger` reveal the rest.
 */
@Directive({
    selector: '[kbqClampedList]',
    providers: [
        { provide: KbqClampedRoot, useExisting: KbqClampedList }
    ],
    host: {
        class: 'kbq-clamped-list',
        '[attr.id]': 'contentId'
    },
    exportAs: 'kbqClampedList'
})
export class KbqClampedList<T> implements KbqClamped {
    private readonly nativeElement = kbqInjectNativeElement();

    /** Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = expanded. */
    readonly isCollapsed = model<boolean>(true);
    /** The list of items to display. */
    readonly items = input<T[]>([]);
    /**
     * Maximum number of items visible in collapsed state.
     * @default 10
     */
    readonly collapsedVisibleCount = input(10, { transform: numberAttribute });
    /**
     * Minimum number of hidden items required to show the toggle trigger.
     * @default 6
     */
    readonly hiddenThreshold = input(6, { transform: numberAttribute });

    /** Id the trigger points its `aria-controls` at. Keeps an id the host already carries. */
    readonly contentId: string = this.nativeElement.id || inject(_IdGenerator).getId('kbq-clamped-list-');

    /** Number of items hidden when the list is collapsed. */
    readonly exceededItemCount = computed(() => this.items().length - this.collapsedVisibleCount());
    /** Whether the number of hidden items meets the threshold to render the toggle trigger. */
    readonly hasToggle = computed(() => this.exceededItemCount() >= this.hiddenThreshold());
    /** Slice of items currently rendered — truncated to `minVisibleCount` when collapsed, a full list otherwise. */
    readonly visibleItems = computed(() =>
        this.isCollapsed() && this.hasToggle() ? this.items().slice(0, this.collapsedVisibleCount()) : this.items()
    );
    /** Localized "show more" label with the exceeded item count interpolated into the `{exceededItemCount}` placeholder. */
    readonly showMoreCountText = computed(() =>
        this.localeConfiguration().showMoreText.replace('{exceededItemCount}', this.exceededItemCount().toString(10))
    );

    /** Clamped text locale configuration. */
    readonly localeConfiguration = kbqInjectClampedTextLocaleConfiguration();

    /** Toggles the collapsed state of the list. Stops event propagation. */
    toggle(event: Event) {
        event.stopPropagation();
        this.isCollapsed.update((state) => !state);
    }
}

/**
 * Disclosure control for the clamped container it is projected into — `[kbqClampedList]` or
 * `<kbq-clamped-text>`. Supplies the button semantics itself, so a host element does not have to:
 * `role`, `tabindex`, `aria-expanded` and `aria-controls` all come from here, and a `role` or
 * `tabindex` written on the element wins over the defaults.
 */
@Directive({
    selector: '[kbqClampedListTrigger]',
    host: {
        class: 'kbq-clamped-list__trigger',
        role: 'button',
        tabindex: '0',
        '[attr.aria-expanded]': 'expanded()',
        '[attr.aria-controls]': 'root?.contentId ?? null',
        '(click)': 'root?.toggle($event)',
        '(keydown.enter)': 'onKeydown($event)',
        '(keydown.space)': 'onKeydown($event)'
    },
    exportAs: 'kbqClampedListTrigger'
})
export class KbqClampedListTrigger {
    protected readonly root = inject(KbqClampedRoot, { optional: true });

    /**
     * Disclosure state of the controlled region. The trigger is only rendered while `hasToggle()`
     * holds, so the container's own collapsed state is what the user sees at that point.
     */
    protected readonly expanded = computed(() => {
        const root = this.root;

        if (!root) return null;

        return !(root.hasToggle() && (root.isCollapsed() ?? true));
    });

    /**
     * Activates the trigger from the keyboard. `preventDefault()` keeps Space from scrolling the
     * page on the non-native hosts this directive is meant for, and suppresses the synthetic click
     * a native button would fire on top of this handler.
     */
    protected onKeydown(event: KeyboardEvent): void {
        event.preventDefault();
        this.root?.toggle(event);
    }
}
