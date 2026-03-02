import { computed, Directive, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqClampedTextLocaleConfig } from '@koobiq/components/core';
import { map, of } from 'rxjs';
import { KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION, KbqClamped, KbqClampedRoot } from './constants';

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
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    /** The list of items to display. */
    readonly items = input<T[]>([]);
    /**
     * Maximum number of items visible in collapsed state.
     * @default 10
     */
    readonly collapsedVisibleCount = input(10);
    /**
     * Minimum number of hidden items required to show the toggle trigger.
     * @default 6
     */
    readonly hiddenThreshold = input(6);
    /** Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = expanded. */
    readonly isCollapsed = model<boolean>(true);

    /** Number of items hidden when the list is collapsed. */
    readonly exceededItemCount = computed(() => this.items().length - this.collapsedVisibleCount());
    /** Whether the number of hidden items meets the threshold to render the toggle trigger. */
    readonly hasToggle = computed(() => this.exceededItemCount() >= this.hiddenThreshold());
    /** Slice of items currently rendered — truncated to `minVisibleCount` when collapsed, full list otherwise. */
    readonly visibleItems = computed(() =>
        this.isCollapsed() ? this.items().slice(0, this.collapsedVisibleCount()) : this.items()
    );

    /** Clamped text locale configuration. */
    readonly localeConfiguration = toSignal<KbqClampedTextLocaleConfig>(
        this.localeService
            ? this.localeService.changes.pipe(
                  map(() => this.localeService!.getParams('clampedText') satisfies KbqClampedTextLocaleConfig)
              )
            : of(inject(KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION))
    );

    /** Toggles the collapsed state of the list. Stops event propagation. */
    toggleIsCollapsed(event: Event) {
        event.stopPropagation();
        this.isCollapsed.update((state) => !(state ?? false));
    }
}

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
    root = inject(KbqClampedRoot, { optional: true });
}
