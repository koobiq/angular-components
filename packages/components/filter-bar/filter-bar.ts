import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    effect,
    forwardRef,
    inject,
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
