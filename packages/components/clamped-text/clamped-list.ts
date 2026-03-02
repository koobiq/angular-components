import { computed, Directive, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqClampedTextLocaleConfig } from '@koobiq/components/core';
import { map, of } from 'rxjs';
import { KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION, KbqClamped } from './constants';

@Directive({
    selector: '[kbqClampedList]',
    exportAs: 'kbqClampedList',
    host: {
        class: 'kbq-clamped-list',
        '[attr.aria-expanded]': 'collapsedState() ? "false" : "true"'
    }
})
export class KbqClampedList<T> implements KbqClamped {
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    /** Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = expanded. */
    readonly isCollapsed = input<boolean>();
    readonly items = input<T[]>([]);

    readonly minVisibleCount = input(10);
    readonly hiddenThreshold = input(6);

    readonly isCollapsedChange = output<boolean>();

    // public, used outside
    isExceededItem = computed(() => this.items().length - this.minVisibleCount() >= this.hiddenThreshold());
    exceededItemCount = computed(() => this.items().length - this.minVisibleCount());
    visibleItems = computed(() =>
        this.collapsedState() ? this.items().slice(0, this.minVisibleCount()) : this.items()
    );

    /**
     * This flag controls event emission, aria/css-class calculation
     * @docs-private
     */
    readonly collapsedState = signal<boolean | undefined>(undefined);
    /** @docs-private */
    readonly hasToggle = computed(() => this.items().length - this.minVisibleCount() >= this.hiddenThreshold());

    /**
     * Clamped text locale configuration.
     * @docs-private
     */
    readonly localeConfiguration = toSignal<KbqClampedTextLocaleConfig>(
        this.localeService
            ? this.localeService.changes.pipe(
                  map(() => this.localeService!.getParams('clampedText') satisfies KbqClampedTextLocaleConfig)
              )
            : of(inject(KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION))
    );

    constructor() {
        toObservable(this.isCollapsed)
            .pipe(takeUntilDestroyed())
            .subscribe((value) => {
                this.collapsedState.set(value);
            });
    }

    toggleIsCollapsed(event: Event) {
        event.stopPropagation();
        this.collapsedState.update((state) => !(state ?? false));
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
    root = inject(KbqClampedList, { optional: true });
}
