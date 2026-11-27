import { _IdGenerator } from '@angular/cdk/a11y';
import {
    type AfterViewInit,
    booleanAttribute,
    computed,
    contentChild,
    contentChildren,
    Directive,
    inject,
    input,
    model,
    numberAttribute,
    untracked
} from '@angular/core';
import {
    type KbqFlexWrap,
    kbqInjectNativeElement,
    KbqLocaleOverridesDirective,
    type KbqOrientation
} from '@koobiq/components/core';
import { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { kbqInjectClampedListOverflow } from './clamped-list-overflow';
import { kbqInjectCollapseAnimation } from './collapse-animation';
import {
    type KbqClamped,
    type KbqClampedListMode,
    KbqClampedRoot,
    kbqInjectClampedTextLocaleConfiguration
} from './constants';

/**
 * Renders a long list compactly using Count-based Collapse or Overflow-based Collapse and lets a projected
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
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ],
    exportAs: 'kbqClampedList'
})
export class KbqClampedList<T> implements KbqClamped, AfterViewInit {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly animateCollapse = kbqInjectCollapseAnimation();

    /** Clamped text locale configuration. */
    readonly localeConfiguration = kbqInjectClampedTextLocaleConfiguration();

    /** Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = expanded. */
    readonly isCollapsed = model<boolean>(true);

    /** The list of items to display. */
    readonly items = input<T[]>([]);

    /**
     * Algorithm used to choose the visible part of a collapsed Clamped List: Count-based Collapse
     * keeps the first `collapsedVisibleCount` items, Overflow-based Collapse measures the container
     * and hides what does not fit. Defaults to `'count'`.
     */
    readonly mode = input<KbqClampedListMode>('count');

    /** Orientation of the list layout. Defaults to `'horizontal'`. */
    readonly orientation = input<KbqOrientation>('horizontal');

    /** Whether the list wraps onto multiple lines. Defaults to `'nowrap'`. */
    readonly wrap = input<KbqFlexWrap>('nowrap');

    /** Whether the list scrolls its host into view after collapse. Defaults to `true`. */
    readonly scrollOnCollapse = input<boolean, boolean | string>(true, { transform: booleanAttribute });

    /**
     * Maximum number of items visible in collapsed state. Defaults to `10`.
     */
    readonly collapsedVisibleCount = input(10, { transform: numberAttribute });

    /**
     * Minimum number of hidden items required to show the toggle trigger. Defaults to `6`.
     */
    readonly hiddenThreshold = input(6, { transform: numberAttribute });

    /**
     * Duration of the expand and collapse animation in milliseconds.
     * Only state changes made through the disclosure toggle animate: programmatic writes of
     * `isCollapsed` and changes of `items` switch instantly. Defaults to `100`.
     */
    readonly duration = input<number, number | string | null | undefined>(100, { transform: numberAttribute });

    /** Overflow Items directives rendered inside the list, in DOM order. */
    private readonly overflowItems = contentChildren(KbqOverflowItem);

    /** Overflow Items result directive projected next to the items. */
    private readonly overflowResult = contentChild(KbqOverflowItemsResult);

    /** What the hidden set depends on besides the geometry: data items, item ids/`alwaysVisible`, result, layout and collapse state. */
    private readonly overflowDependencies = computed<readonly unknown[]>(() => [
        this.items(),
        this.overflowItems().map((item) => [item.id(), item.alwaysVisible()]),
        this.overflowResult(),
        this.mode(),
        this.orientation(),
        this.wrap(),
        this.collapsedVisibleCount(),
        this.hiddenThreshold(),
        this.isCollapsed()
    ]);

    /** Id the trigger points its `aria-controls` at. Keeps an id the host already carries. */
    readonly contentId: string = this.nativeElement.id || inject(_IdGenerator).getId('kbq-clamped-list-');

    /**
     * Overflow-based Collapse controller. In Count-based Collapse its hidden set stays `null`.
     */
    private readonly overflow = kbqInjectClampedListOverflow({
        host: this.nativeElement,
        itemDirectives: this.overflowItems,
        result: this.overflowResult,
        items: this.items,
        dependencies: this.overflowDependencies,
        mode: this.mode,
        orientation: this.orientation,
        wrap: this.wrap,
        hiddenThreshold: this.hiddenThreshold,
        isCollapsed: this.isCollapsed,
        hasToggle: () => this.hasToggle(),
        visibleMap: () => this.visibleMap()
    });

    /** Number of items hidden when the list is collapsed. */
    readonly exceededItemCount = computed(() => {
        const overflowHidden = this.mode() === 'overflow' ? this.overflow.hiddenItemIDs() : null;

        return overflowHidden ? overflowHidden.size : this.items().length - this.collapsedVisibleCount();
    });

    /** Whether the number of hidden items meets the threshold to render the toggle trigger. */
    readonly hasToggle = computed(() => this.exceededItemCount() >= this.hiddenThreshold());

    /**
     * Whether each item of `items` is visible: all `true` when the list is expanded or the toggle
     * threshold is not met. In Overflow-based Collapse the measured hidden items win over
     * `collapsedVisibleCount` once the measurement has run.
     */
    readonly visibleMap = computed<readonly boolean[]>(() => {
        const items = this.items();
        const collapsed = this.isCollapsed() === true;
        const hasToggle = this.hasToggle();
        const overflowHidden = this.mode() === 'overflow' ? this.overflow.hiddenItemIDs() : null;

        return items.map((_, index) => {
            if (!collapsed || !hasToggle) return true;
            if (overflowHidden) return !overflowHidden.has(index);

            return index < this.collapsedVisibleCount();
        });
    });

    /** Items currently visible according to `visibleMap`: the full list when expanded, otherwise the count- or geometry-based collapsed subset. */
    readonly visibleItems = computed(() => this.items().filter((_, index) => this.visibleMap()[index]));

    /** Localized "show more" label with the exceeded item count interpolated into the `{exceededItemCount}` placeholder. */
    readonly showMoreCountText = computed(() =>
        this.localeConfiguration().showMoreText.replace('{exceededItemCount}', this.exceededItemCount().toString(10))
    );

    /** Localized "show more compact" label with the exceeded item count interpolated into the `{exceededItemCount}` placeholder. */
    readonly showMoreCompactCountText = computed(() => {
        const { showMoreTextCompact, moreText } = this.localeConfiguration();
        const count = this.exceededItemCount().toString(10);

        return showMoreTextCompact?.replace('{exceededItemCount}', count) ?? `${count} ${moreText}`;
    });

    /**
     * Writes the initial visibility through the Overflow Items directives, so server-side rendering
     * emits the hidden items without waiting for the browser measurement.
     */
    ngAfterViewInit(): void {
        this.overflow.applyVisibility();
    }

    /** Toggles the collapsed state of the list. Stops event propagation. */
    toggle(event: Event): void {
        event.stopPropagation();

        // Untracked: called from a consumer's `effect()`, the collapsed state read here would make the effect toggle
        // again on every change it makes.
        untracked(() => {
            const settled = this.animateCollapse(this.nativeElement, this.duration(), () => {
                this.isCollapsed.update((state) => !state);
                // The animation measures the host right after the change, so the visibility lands here rather
                // than in the debounced recalculation the state flip also schedules.
                this.overflow.applyVisibility();
            });

            if (this.scrollOnCollapse() && this.isCollapsed()) {
                void settled.then(() => this.nativeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
            }
        });
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
        '(keydown.enter)': 'onKeydown($any($event))',
        '(keydown.space)': 'onKeydown($any($event))'
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
