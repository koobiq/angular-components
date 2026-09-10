import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
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
import { kbqInjectLocaleConfiguration, KbqStateSaving } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { BehaviorSubject } from 'rxjs';
import {
    KBQ_FILTER_BAR_CONFIGURATION,
    KBQ_FILTER_BAR_HOST,
    KbqFilter,
    KbqFilterBarConfiguration,
    KbqFilterBarHost,
    KbqFilterBarState,
    KbqPipe,
    KbqPipeTemplate
} from './filter-bar.types';
import { KbqFilterReset } from './filter-reset';
import { KbqFilters } from './filters';
import { getId } from './pipes/base-pipe';

/**
 * Coerces a raw persisted payload into a `KbqFilterBarState`, returning `null` for anything
 * unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so a payload is never trusted — without this, a
 * hand-edited entry would decide which filter the application loads its data for.
 */
const normalizeFilterBarState = (parsed: unknown): KbqFilterBarState | null => {
    const state = parsed as Partial<KbqFilterBarState> | null;

    if (typeof state?.name !== 'string' || typeof state.changed !== 'boolean' || !Array.isArray(state.pipes)) {
        return null;
    }

    const pipes = (state.pipes as unknown[]).map((pipe) => {
        const id = (pipe as { id?: unknown } | null)?.id;

        return typeof id === 'string' || typeof id === 'number'
            ? { id, value: (pipe as { value?: unknown }).value ?? null }
            : null;
    });

    // One unusable entry makes the whole list somebody else's payload: restoring the rest would produce a
    // filter the user never had, and the application would fetch data for it.
    return pipes.every((pipe) => pipe !== null)
        ? { changed: state.changed, name: state.name, pipes: pipes as KbqFilterBarState['pipes'] }
        : null;
};

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
    },
    // `useStateSaving` and `stateSavingKey` are the directive's inputs, surfaced on the filter bar.
    hostDirectives: [
        { directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }
    ]
})
export class KbqFilterBar implements KbqFilterBarHost, AfterContentInit {
    /**
     * Localized strings and configuration for the filter-bar and its pipes.
     *
     * Read through a signal so that a runtime `setLocale()` reaches the pipes and the projected
     * sub-components, which render these strings from their own `OnPush` views.
     */
    get configuration(): KbqFilterBarConfiguration {
        return this._configuration();
    }

    private readonly _configuration = kbqInjectLocaleConfiguration('filterBar', KBQ_FILTER_BAR_CONFIGURATION);

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

    /**
     * Persistence of the selected filter and its edits, applied as a host directive. `useStateSaving` and
     * `stateSavingKey` are its inputs, forwarded onto the filter bar.
     */
    private readonly stateSaving = inject(KbqStateSaving);

    /** The payload read while initializing, held until the data it needs to be applied has arrived. */
    private pendingState: KbqFilterBarState | null = null;

    /** The filter that was selected when the payload was read, to tell a later change from that one. */
    private filterWhenPending: KbqFilter | null = null;

    /** Whether the filter is being written by a restore, so the write below does not echo it back. */
    private restoring = false;

    /** Whether the persisted state has been read; reading twice would resurrect a dismissed filter. */
    private hasRead = false;

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
    /** Requests that an already-added pipe open its pop-up. See {@link KbqFilterBarHost.openPipe}.
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

        // Every path that changes the filter — a pipe edit, an add, a remove, selecting a filter, saving
        // changes, a reset — produces a new filter reference, so one effect covers them all. `write()` is a
        // no-op before the first `read()` and inside `applying()`, so neither the input binding that runs
        // while initializing nor the restore itself can overwrite what is stored.
        effect(() => {
            const filter = this.filter();

            if (this.restoring) return;

            // Something else moved the filter while the payload was still waiting for its data: the
            // application drove it, or the user did. Either way the payload is stale.
            if (this.pendingState && filter !== this.filterWhenPending) {
                this.pendingState = null;
            }

            this.persistState(filter);
        });

        // Applications load their saved filters from a server, so the list — and the templates a pipe the
        // user added is rebuilt from — routinely arrive after initialization. Retry until the payload can
        // be applied, or until the effect above finds it stale.
        effect(() => {
            const filters = this.filters()?.filters();
            const pipeTemplates = this.pipeTemplates();

            if (this.pendingState) this.applyPendingState(filters, pipeTemplates);
        });

        // Moving the bar to another key means its state lives there now: restore from it, rather than
        // keeping what the previous key held and writing nothing.
        this.stateSaving.keyChanges.subscribe(() => this.restoreState());
    }

    ngAfterContentInit(): void {
        // `filters` is a content child, so the list of saved filters cannot be reached any earlier.
        if (this.hasRead || !this.persists) return;

        this.hasRead = true;

        this.restoreState();
    }

    /** Reads the persisted state and applies it. Runs while initializing, and again on a key change. */
    private restoreState(): void {
        if (!this.persists) return;

        this.pendingState = this.stateSaving.read(normalizeFilterBarState);
        this.filterWhenPending = this.filter();

        if (this.pendingState) this.applyPendingState(this.filters()?.filters(), this.pipeTemplates());
    }

    /**
     * Removes the state persisted for this filter bar.
     *
     * Persistence itself stays on — the next change is written again. Unset `useStateSaving` to stop it.
     * Unrelated to `restoreFilterState()`, which reverts to an in-memory snapshot within one session.
     */
    clearSavedState(): void {
        this.stateSaving.clear();
    }

    /**
     * Whether state is currently persisted for this filter bar — restored on init, or written since.
     * Always `false` while `useStateSaving` is unset, and `false` again after `clearSavedState()`.
     */
    get hasSavedState(): boolean {
        return this.stateSaving.state != null;
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

    /** Whether this filter bar reads and writes its state at all. */
    private get persists(): boolean {
        // A bar that is not in the document has no stable key — the default resolver derives one from the
        // path to `<body>` — which is the ordinary state of one projected into an overlay.
        return this.stateSaving.useStateSaving() && !!this.stateSaving.host?.isConnected;
    }

    /**
     * Persists which filter is selected and the edits made to it.
     *
     * A bar with nothing selected removes its entry rather than storing an empty filter: the next load
     * should fall back to whatever default the application supplies, not to a filter with no name.
     */
    private persistState(filter: KbqFilter | null): void {
        // `write()` is a no-op before the first `read()`, but `clear()` below is not: without this the
        // effect's first run — where the filter is still `null` — would erase what the previous visit left
        // before it has been read.
        if (!this.hasRead || !this.persists) return;

        if (!filter) {
            this.stateSaving.clear();

            return;
        }

        this.stateSaving.write({
            changed: filter.changed,
            name: filter.name,
            // A projection, not the pipes: one built from a template keeps that template's `compareWith`
            // and date bounds, which `JSON.stringify` drops silently rather than rejecting.
            pipes: filter.pipes.map((pipe) => ({ id: getId(pipe), value: pipe.value ?? null }))
        } satisfies KbqFilterBarState);
    }

    /**
     * The filter a named payload is rebuilt over when no `<kbq-filters>` is projected.
     *
     * A name is looked up in the projected list, and not finding it there normally means the list has not
     * arrived yet — applications load their saved filters from a server, and waiting is what lets a late
     * one still restore. With no `<kbq-filters>` in the markup at all there is no list the name could ever
     * appear in, so that wait would never end: the bar would write on every change and read nothing back.
     * The filter the application already selected is the only base there will be, and it is the right one
     * while it carries that same name.
     */
    private baseWithoutFilterList(name: string, current: KbqFilter | null): KbqFilter | undefined {
        return !this.filters() && current?.name === name ? current : undefined;
    }

    /**
     * Rebuilds the persisted filter and selects it, or leaves the payload pending while what it needs is
     * still missing.
     */
    private applyPendingState(filters: KbqFilter[] | undefined, pipeTemplates: KbqPipeTemplate[]): void {
        const state = this.pendingState!;
        const current = this.filter();
        const base = state.name
            ? (filters?.find(({ name }) => name === state.name) ?? this.baseWithoutFilterList(state.name, current))
            : // A filter the user never saved has no entry to be found: rebuild it around whatever the
              // application selected by default, or around nothing at all.
              (current ?? {
                  changed: false,
                  disabled: false,
                  name: '',
                  pipes: [],
                  readonly: false,
                  saved: false
              });

        // The saved filters have not arrived yet, or that one is gone from the list. Keep waiting: the
        // effect above drops the payload as soon as anything else moves the filter.
        if (!base) return;

        const pipes: KbqPipe[] = [];

        for (const { id, value } of state.pipes) {
            const existing = base.pipes.find((pipe) => getId(pipe) === id);

            if (existing) {
                // Copied rather than reused, so an edit cannot reach the application's own array.
                pipes.push({ ...existing, value });

                continue;
            }

            const template = pipeTemplates.find((item) => getId(item) === id);

            // Built the way `KbqPipeAdd` builds one, minus `openOnAdd`: a restored pipe must not open its
            // panel. A pipe whose template is gone is left out.
            if (template) {
                pipes.push({ ...template, value, values: undefined, valueTemplate: undefined } as KbqPipe);
            }
        }

        // Nothing could be rebuilt yet — the templates arrive alongside the filters.
        if (state.pipes.length && !pipes.length) return;

        this.pendingState = null;
        this.restoring = true;

        try {
            // Through the model, so `filterChange` fires and the application fetches for the restored
            // filter exactly as it would for one the user had picked.
            this.stateSaving.applying(() => this.filter.set({ ...base, changed: state.changed, pipes }));
        } finally {
            this.restoring = false;
        }
    }
}
