import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    effect,
    forwardRef,
    inject,
    Injector,
    input,
    model,
    output,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { BehaviorSubject } from 'rxjs';
import {
    KBQ_FILTER_BAR_CONFIGURATION,
    KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
    KBQ_FILTER_BAR_HOST,
    KbqFilter,
    KbqFilterBarConfiguration,
    KbqFilterBarHost,
    KbqPipe,
    KbqPipeTemplate
} from './filter-bar.types';
import { KbqFilterReset } from './filter-reset';
import { KbqFilters } from './filters';

@Component({
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    imports: [KbqDividerModule, NgTemplateOutlet],
    template: `
        <!-- Compatible: the <ng-content> can appear only once, so the search is projected here and
             outlet into exactly one of the two mutually exclusive branches below. -->
        <ng-template #searchOutlet>
            <ng-content select="kbq-search-expandable" />
        </ng-template>

        <div class="kbq-filter-bar__left">
            <ng-content select="kbq-filters" />

            @if (searchPlacement() === 'start') {
                <ng-container [ngTemplateOutlet]="searchOutlet" />
            }

            <ng-content />

            <ng-content select="kbq-pipe-add" />

            <ng-content select="kbq-filter-reset" />
        </div>

        @if (searchPlacement() !== 'start') {
            <div class="kbq-filter-bar__search">
                <ng-container [ngTemplateOutlet]="searchOutlet" />
            </div>
        }

        <div class="kbq-filter-bar__right">
            <ng-content select="kbq-filter-refresher, [kbq-filter-refresher]" />
        </div>
    `,
    styleUrls: ['filter-bar-tokens.scss', 'filter-bar.scss'],
    providers: [{ provide: KBQ_FILTER_BAR_HOST, useExisting: forwardRef(() => KbqFilterBar) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filter-bar',
        '[class.kbq-filter-bar_search-start]': 'searchPlacement() === "start"',
        '[class.kbq-filter-bar_search-end]': 'searchPlacement() !== "start"',
        '(focusin)': 'onSearchFocusIn($event)'
    }
})
export class KbqFilterBar implements KbqFilterBarHost {
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly document = inject<Document>(DOCUMENT);
    private readonly injector = inject(Injector);

    /**
     * Tracks the last element focused inside the projected `kbq-search-expandable`, so focus can be
     * restored after a `searchPlacement()` change: toggling it destroys and recreates the outlet branch
     * that holds the projected content, physically detaching/reattaching the DOM node, which blurs a
     * focused descendant (removeChild-triggered focus loss, per the DOM spec).
     */
    private lastFocusedSearchElement: HTMLElement | null = null;

    readonly externalConfiguration = inject(KBQ_FILTER_BAR_CONFIGURATION, { optional: true });

    /** Localized strings and configuration for the filter-bar and its pipes. */
    configuration: KbqFilterBarConfiguration = KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;

    /** @docs-private */
    readonly filters = contentChild(KbqFilters);
    /** @docs-private */
    readonly filterReset = contentChild(KbqFilterReset);

    /**
     * This is special logic that unselect all items when all selected because "all selected = nothing selected".
     * Default is true
     * */
    readonly selectedAllEqualsSelectedNothing = input<boolean, unknown>(true, { transform: booleanAttribute });

    /**
     * Placement of the projected `kbq-search-expandable` within the bar.
     * `'end'` (default) keeps it trailing (right in LTR), clear of the pipes — the previous behavior.
     * `'start'` moves it into the pipe row — directly after `kbq-filters` and ahead of the pipes,
     * where it lays out as the first pipe. RTL-aware.
     */
    readonly searchPlacement = input<'start' | 'end'>('end');

    /**
     * Filter that is currently selected. A two-way-bindable `model()`: derived state (`isSaved`/`isChanged`/…)
     * is exposed via `computed()` off it and change detection is driven by signal reactivity. `model()`
     * auto-provides the `filterChange` output for `[(filter)]` two-way binding.
     */
    readonly filter = model<KbqFilter | null>(null);

    /** An array of templates that are used when adding a pipe. Also contains lists of options to select (values). */
    readonly pipeTemplates = input<KbqPipeTemplate[]>([]);

    /** Event that emits whenever the value of the pipe changes. */
    readonly onChangePipe = output<KbqPipe>();
    /** Event that emits whenever the pipe deleted. */
    readonly onRemovePipe = output<KbqPipe>();
    /** Event that emits whenever the pipe cleared. */
    readonly onClearPipe = output<KbqPipe>();
    /** Event that emits whenever the select or multiselect pipe closed. */
    readonly onClosePipe = output<KbqPipe>();

    /** Whether the current filter is saved */
    readonly isSaved = computed(() => !!this.filter()?.saved);

    /** Whether the current filter is changed */
    readonly isChanged = computed(() => !!this.filter()?.changed);

    /** Whether the current filter is saved and changed */
    readonly isSavedAndChanged = computed(() => this.isSaved() && this.isChanged());

    /** Whether the current filter is readonly */
    readonly isReadOnly = computed(() => !!this.filter()?.readonly);

    /** Whether the current filter is disabled */
    readonly isDisabled = computed(() => !!this.filter()?.disabled);

    private savedFilter: KbqFilter | null = null;

    /**
     * All changes.
     * @deprecated noop. Reactivity is driven by the `filter` signal now; this never emits and will be
     * removed in the next major.
     */
    readonly changes = new BehaviorSubject<void>(undefined);

    /** Event that emits whenever the filter is reset. */
    readonly onResetFilter = new BehaviorSubject<boolean>(false);
    /** internal filter changes */
    readonly internalFilterChanges = new BehaviorSubject<KbqFilter | null>(null);
    /** internal changes in templates */
    readonly internalTemplatesChanges = new BehaviorSubject<KbqPipeTemplate[] | null>(null);
    /** this subject need for opens pipe after adding
     * @docs-private */
    readonly openPipe = new BehaviorSubject<string | number | null>(null);

    constructor() {
        // Push template changes into the internal stream — replaces the retired `pipeTemplates` accessor
        // setter side effect now that `pipeTemplates` is a signal `input()`.
        effect(() => this.internalTemplatesChanges.next(this.pipeTemplates()));

        let isFirstSearchPlacementRun = true;

        // Restore focus after a `searchPlacement()` change relocates the projected search element (see
        // `lastFocusedSearchElement`). Skip the initial run — there's nothing to restore on mount.
        effect(() => {
            this.searchPlacement();

            if (isFirstSearchPlacementRun) {
                isFirstSearchPlacementRun = false;

                return;
            }

            const elementToRefocus = this.lastFocusedSearchElement;

            if (!elementToRefocus?.isConnected) return;

            afterNextRender(
                () => {
                    // Only steal focus back if the relocation blurred it to nothing (`body`) — if the
                    // user or app intentionally focused something else in the meantime, leave it alone.
                    if (this.document.activeElement === this.document.body) {
                        elementToRefocus.focus();
                    }
                },
                { injector: this.injector }
            );
        });

        this.internalFilterChanges.pipe(takeUntilDestroyed()).subscribe((filter) => {
            // `model.set(...)` auto-emits `filterChange` for the two-way binding.
            this.filter.set(filter);
        });

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }

        // A pipe value change marks the current filter as "changed". Produce a new filter reference (not an
        // in-place mutation) so the `filter` model — and every `computed()`/`effect()` reading it — reacts.
        // `removePipe` owns its own `changed` flag in a single `set` (one `filterChange` emission), so only
        // `onChangePipe` feeds this subscriber. `model.set(...)` auto-emits `filterChange` for the binding.
        outputToObservable(this.onChangePipe)
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                const current = this.filter();

                if (current) {
                    this.filter.set({ ...current, changed: true });
                }
            });
    }

    /** @docs-private */
    protected onSearchFocusIn(event: FocusEvent) {
        const target = event.target as HTMLElement;

        if (target.closest('kbq-search-expandable')) {
            this.lastFocusedSearchElement = target;
        }
    }

    /** Remove pipe from current filter and emit event */
    removePipe(pipe: KbqPipe) {
        const current = this.filter();

        if (!current?.pipes.includes(pipe)) return;

        // Replace the filter (and its `pipes` array) with new references instead of mutating in place, so the
        // `filter` signal reacts; unknown pipes are left untouched. Fold in `changed: true` here — the removal
        // IS the change — so it happens in a single `set` (one `filterChange` emission) rather than relying on
        // `onRemovePipe` to trigger a second update.
        this.filter.set({ ...current, changed: true, pipes: current.pipes.filter((item) => item !== pipe) });

        this.onRemovePipe.emit(pipe);
    }

    /**
     * Save current state of filter.
     *
     * Deep-clones the filter via `structuredClone`, so any pipe `value` payload handed to save/restore must be
     * structured-cloneable (plain data — no functions, DOM nodes, class instances or `TemplateRef`s), otherwise
     * `structuredClone` throws `DataCloneError`. All built-in pipes produce cloneable values.
     */
    saveFilterState(filter?: KbqFilter) {
        this.savedFilter = structuredClone(filter ?? this.filter());
    }

    /**
     * Restore previously saved filter state.
     *
     * @see `saveFilterState` — pipe `value` payloads must be structured-cloneable.
     */
    restoreFilterState(filter?: KbqFilter) {
        const state = filter ?? this.savedFilter;

        // Nothing to restore — bail out instead of wiping the current filter with `structuredClone(null)`.
        if (!state) return;

        this.filter.set(structuredClone(state));
    }

    /** Set the filter state "changed" to false */
    resetFilterChangedState() {
        const current = this.filter();

        if (!current) return;

        this.filter.set({ ...current, changed: false });
    }

    private updateLocaleParams = () => {
        this.configuration = this.externalConfiguration || this.localeService?.getParams('filterBar');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;
    }
}
