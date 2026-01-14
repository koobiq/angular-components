import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { BehaviorSubject, merge } from 'rxjs';
import {
    KBQ_FILTER_BAR_CONFIGURATION,
    KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
    KbqFilter,
    KbqPipe,
    KbqPipeTemplate
} from './filter-bar.types';
import { KbqFilterReset } from './filter-reset';
import { KbqFilters } from './filters';

@Component({
    standalone: true,
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    template: `
        <div class="kbq-filter-bar__left">
            <ng-content select="kbq-filters" />

            <ng-content />

            <ng-content select="kbq-pipe-add" />

            <ng-content select="kbq-filter-reset" />
        </div>

        <div class="kbq-filter-bar__right">
            <ng-content select="kbq-filter-search, [kbq-filter-search], kbq-search-expandable" />

            <ng-content select="kbq-filter-refresher, [kbq-filter-refresher]" />
        </div>
    `,
    styleUrls: ['filter-bar.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [KbqDividerModule],
    host: {
        class: 'kbq-filter-bar'
    }
})
export class KbqFilterBar {
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    readonly externalConfiguration = inject(KBQ_FILTER_BAR_CONFIGURATION, { optional: true });

    configuration;

    /** @docs-private */
    @ContentChild(KbqFilters) filters: KbqFilters;
    /** @docs-private */
    @ContentChild(KbqFilterReset) filterReset: KbqFilterReset;

    /**
     * This is special logic that unselect all items when all selected because "all selected = nothing selected".
     * Default is true
     * */
    @Input({ transform: booleanAttribute }) selectedAllEqualsSelectedNothing: boolean = true;

    /** Filter that is currently selected */
    @Input()
    get filter(): KbqFilter | null {
        return this._filter;
    }

    set filter(value: KbqFilter | null) {
        if (this._filter === value) return;

        this._filter = value;

        this.changes.next();
    }

    private _filter: KbqFilter | null;

    /** An array of templates that are used when adding a pipe. Also contains lists of options to select (values). */
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
    @Output() readonly filterChange = new EventEmitter<KbqFilter | null>();
    /** Event that emits whenever the value of the pipe changes. */
    @Output() readonly onChangePipe = new EventEmitter<KbqPipe>();
    /** Event that emits whenever the pipe deleted. */
    @Output() readonly onRemovePipe = new EventEmitter<KbqPipe>();
    /** Event that emits whenever the pipe cleared. */
    @Output() readonly onClearPipe = new EventEmitter<KbqPipe>();
    /** Event that emits whenever the select or multiselect pipe closed. */
    @Output() readonly onClosePipe = new EventEmitter<KbqPipe>();

    /** Whether the current filter is saved and changed */
    get isSavedAndChanged(): boolean {
        return this.isSaved && this.isChanged;
    }

    /** Whether the current filter is saved */
    get isSaved(): boolean {
        return !!this.filter?.saved;
    }

    /** Whether the current filter is changed */
    get isChanged(): boolean {
        return !!this.filter?.changed;
    }

    /** Whether the current filter is readonly */
    get isReadOnly(): boolean {
        return !!this.filter?.readonly;
    }

    /** Whether the current filter is disabled */
    get isDisabled(): boolean {
        return !!this.filter?.disabled;
    }

    private savedFilter: KbqFilter | null = null;

    /** Event that emits whenever the filter is reset. */
    readonly onResetFilter = new BehaviorSubject<boolean>(false);
    /** all changes */
    readonly changes = new BehaviorSubject<void>(undefined);
    /** internal filter changes */
    readonly internalFilterChanges = new BehaviorSubject<KbqFilter | null>(null);
    /** internal changes in templates */
    readonly internalTemplatesChanges = new BehaviorSubject<KbqPipeTemplate[] | null>(null);
    /** this subject need for opens pipe after adding
     * @docs-private */
    readonly openPipe = new BehaviorSubject<string | number | null>(null);

    constructor() {
        this.internalFilterChanges.pipe(takeUntilDestroyed()).subscribe((filter) => {
            this._filter = filter;

            this.filterChange.emit(this.filter);
        });

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }

        merge(this.onChangePipe, this.onRemovePipe)
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                if (this.filter) {
                    this.filter.changed = true;
                    this.filterChange.emit(this.filter);
                }
            });

        merge(this.filterChange, this.onChangePipe, this.onRemovePipe, this.internalFilterChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.changes.next();
                this.changeDetectorRef.markForCheck();
            });
    }

    /** Remove pipe from current filter and emit event */
    removePipe(pipe: KbqPipe) {
        this.filter?.pipes.splice(this.filter?.pipes.indexOf(pipe), 1);

        this.onRemovePipe.next(pipe);
        this.changes.next();
    }

    /** Save current state of filter */
    saveFilterState(filter?: KbqFilter) {
        this.savedFilter = structuredClone(filter ?? this.filter);
    }

    /** Restore previously saved filter state */
    restoreFilterState(filter?: KbqFilter) {
        this.filter = structuredClone(filter ?? this.savedFilter);
    }

    /** Set the filter state "changed" to false */
    resetFilterChangedState() {
        this.filter!.changed = false;
    }

    private updateLocaleParams = () => {
        this.configuration = this.externalConfiguration || this.localeService?.getParams('filterBar');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;
    }
}
