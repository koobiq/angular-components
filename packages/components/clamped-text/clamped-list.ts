import { computed, Directive, inject, input, model, numberAttribute } from '@angular/core';
import { injectKbqClampedLocaleConfiguration, KbqClamped, KbqClampedRoot } from './constants';

@Directive({
    selector: '[kbqClampedList]',
    exportAs: 'kbqClampedList',
    host: {
        class: 'kbq-clamped-list',
        '[attr.aria-expanded]': 'isCollapsed() ? "false" : "true"'
    },
    providers: [
        { provide: KbqClampedRoot, useExisting: KbqClampedList }]
})
export class KbqClampedList<T> implements KbqClamped {
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

    /** Number of items hidden when the list is collapsed. */
    readonly exceededItemCount = computed(() => this.items().length - this.collapsedVisibleCount());
    /** Whether the number of hidden items meets the threshold to render the toggle trigger. */
    readonly hasToggle = computed(() => this.exceededItemCount() >= this.hiddenThreshold());
    /** Slice of items currently rendered — truncated to `minVisibleCount` when collapsed, full list otherwise. */
    readonly visibleItems = computed(() =>
        this.isCollapsed() ? this.items().slice(0, this.collapsedVisibleCount()) : this.items()
    );

    /** Clamped text locale configuration. */
    readonly localeConfiguration = injectKbqClampedLocaleConfiguration();

    /** Toggles the collapsed state of the list. Stops event propagation. */
    toggleIsCollapsed(event: Event) {
        event.stopPropagation();
        this.isCollapsed.update((state) => !state);
    }
}

/**
 * Clamped list trigger.
 * Used for calling toggle collapsed state on click events
 */
@Directive({
    selector: '[kbqClampedListTrigger]',
    exportAs: 'kbqClampedListTrigger',
    host: {
        class: 'kbq-clamped-list__trigger kbq-clamped-text__toggle',
        '(click)': 'root?.toggleIsCollapsed($event)',
        '(keydown.enter)': 'root?.toggleIsCollapsed($event)',
        '(keydown.space)': 'root?.toggleIsCollapsed($event)'
    }
})
export class KbqClampedListTrigger {
    protected readonly root = inject(KbqClampedRoot, { optional: true });
}
