import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    forwardRef,
    inject,
    Input,
    input,
    output,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { BehaviorSubject, merge } from 'rxjs';
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
    imports: [KbqDividerModule],
    template: `
        <div class="kbq-filter-bar__left">
            <ng-content select="kbq-filters" />

            <ng-content />

            <ng-content select="kbq-pipe-add" />

            <ng-content select="kbq-filter-reset" />
        </div>

        <div class="kbq-filter-bar__right">
            <ng-content select="kbq-search-expandable" />

            <ng-content select="kbq-filter-refresher, [kbq-filter-refresher]" />
        </div>
    `,
    styleUrls: ['filter-bar-tokens.scss', 'filter-bar.scss'],
    providers: [{ provide: KBQ_FILTER_BAR_HOST, useExisting: forwardRef(() => KbqFilterBar) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filter-bar'
    }
})
export class KbqFilterBar implements KbqFilterBarHost {
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

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
     * Signal backing the `filter` accessor input. Derived state (`isSaved`/`isChanged`/…) is exposed via
     * `computed()` off this signal and change detection is driven by signal reactivity, which replaces the
     * retired `changes` Subject and its manual `markForCheck` fan-out (P1-6).
     */
    private readonly _filter = signal<KbqFilter | null>(null);

    /** Filter that is currently selected */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get filter(): KbqFilter | null {
        return this._filter();
    }

    set filter(value: KbqFilter | null) {
        if (this._filter() === value) return;

        this._filter.set(value);
    }

    /** An array of templates that are used when adding a pipe. Also contains lists of options to select (values). */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get pipeTemplates(): KbqPipeTemplate[] {
        return this._templates;
    }

    set pipeTemplates(value: KbqPipeTemplate[]) {
        this._templates = value;

        this.internalTemplatesChanges.next(this._templates);
    }

    private _templates: KbqPipeTemplate[] = [];
    /**
     * Event that emits whenever the raw value of the filter changes. This is here primarily
     * to facilitate the two-way binding for the `filter` input.
     * @docs-private
     */
    readonly filterChange = output<KbqFilter | null>();
    /** Event that emits whenever the value of the pipe changes. */
    readonly onChangePipe = output<KbqPipe>();
    /** Event that emits whenever the pipe deleted. */
    readonly onRemovePipe = output<KbqPipe>();
    /** Event that emits whenever the pipe cleared. */
    readonly onClearPipe = output<KbqPipe>();
    /** Event that emits whenever the select or multiselect pipe closed. */
    readonly onClosePipe = output<KbqPipe>();

    /** Whether the current filter is saved */
    readonly isSaved = computed(() => !!this._filter()?.saved);

    /** Whether the current filter is changed */
    readonly isChanged = computed(() => !!this._filter()?.changed);

    /** Whether the current filter is saved and changed */
    readonly isSavedAndChanged = computed(() => this.isSaved() && this.isChanged());

    /** Whether the current filter is readonly */
    readonly isReadOnly = computed(() => !!this._filter()?.readonly);

    /** Whether the current filter is disabled */
    readonly isDisabled = computed(() => !!this._filter()?.disabled);

    private savedFilter: KbqFilter | null = null;

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
        this.internalFilterChanges.pipe(takeUntilDestroyed()).subscribe((filter) => {
            this._filter.set(filter);

            this.filterChange.emit(this.filter);
        });

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }

        // A pipe value change or removal marks the current filter as "changed". Produce a new filter
        // reference (not an in-place mutation) so the `filter` signal — and every `computed()`/`effect()`
        // reading it — reacts. This replaces the retired `changes` Subject + `markForCheck` fan-out (P1-6).
        merge(outputToObservable(this.onChangePipe), outputToObservable(this.onRemovePipe))
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                const current = this.filter;

                if (current) {
                    this._filter.set({ ...current, changed: true });

                    this.filterChange.emit(this.filter);
                }
            });
    }

    /** Remove pipe from current filter and emit event */
    removePipe(pipe: KbqPipe) {
        const current = this.filter;

        if (!current?.pipes.includes(pipe)) return;

        // Replace the filter (and its `pipes` array) with new references instead of mutating in place, so
        // the `filter` signal reacts; unknown pipes are left untouched. `onRemovePipe` then flags "changed".
        this._filter.set({ ...current, pipes: current.pipes.filter((item) => item !== pipe) });

        this.onRemovePipe.emit(pipe);
    }

    /** Save current state of filter */
    saveFilterState(filter?: KbqFilter) {
        this.savedFilter = structuredClone(filter ?? this.filter);
    }

    /** Restore previously saved filter state */
    restoreFilterState(filter?: KbqFilter) {
        const state = filter ?? this.savedFilter;

        // Nothing to restore — bail out instead of wiping the current filter with `structuredClone(null)`.
        if (!state) return;

        this.filter = structuredClone(state);
    }

    /** Set the filter state "changed" to false */
    resetFilterChangedState() {
        const current = this.filter;

        if (!current) return;

        this._filter.set({ ...current, changed: false });
    }

    private updateLocaleParams = () => {
        this.configuration = this.externalConfiguration || this.localeService?.getParams('filterBar');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;
    }
}
