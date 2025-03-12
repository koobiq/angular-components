import {
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
import { KbqDividerModule } from '@koobiq/components/divider';
import { BehaviorSubject, merge } from 'rxjs';
import { KbqFilterReset } from './filter-bar-reset';
import { KbqFilter, KbqPipe, KbqPipeTemplate } from './filter-bar.types';
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
            <ng-content select="kbq-filter-bar-search, [kbq-filter-bar-search]" />

            <ng-content select="kbq-filter-bar-refresher, [kbq-filter-bar-refresher]" />
        </div>
    `,
    styleUrls: ['filter-bar.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqDividerModule
    ],
    host: {
        class: 'kbq-filter-bar'
    }
})
export class KbqFilterBar {
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    private savedFilter: KbqFilter | null = null;

    @ContentChild(KbqFilters) filters: KbqFilters;
    @ContentChild(KbqFilterReset) filterReset: KbqFilterReset;

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
    set pipeTemplates(value: KbqPipeTemplate[]) {
        this._templates = value;

        this.internalTemplatesChanges.next(this._templates);
    }

    get pipeTemplates(): KbqPipeTemplate[] {
        return this._templates;
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

    get isSavedAndChanged(): boolean {
        return this.isSaved && this.isChanged;
    }

    get isSaved(): boolean {
        return !!this.filter?.saved;
    }

    get isChanged(): boolean {
        return !!this.filter?.changed;
    }

    get isReadOnly(): boolean {
        return !!this.filter?.readonly;
    }

    get isDisabled(): boolean {
        return !!this.filter?.disabled;
    }

    readonly changes = new BehaviorSubject<void>(undefined);
    readonly internalFilterChanges = new BehaviorSubject<KbqFilter | null>(null);
    readonly internalTemplatesChanges = new BehaviorSubject<KbqPipeTemplate[] | null>(null);
    readonly openPipe = new BehaviorSubject<string | number | null>(null);

    constructor() {
        this.internalFilterChanges.subscribe((filter) => {
            this._filter = filter;

            this.filterChange.emit(this.filter);
        });

        merge(this.onChangePipe, this.onRemovePipe).subscribe(() => {
            if (this.filter) {
                this.filter.changed = true;
            }

            this.filterChange.emit(this.filter);
        });

        merge(this.filterChange, this.onChangePipe, this.onRemovePipe, this.internalFilterChanges).subscribe(() => {
            this.changes.next();
            this.changeDetectorRef.markForCheck();
        });
    }

    /** Remove pipe from current filter and emit event */
    removePipe(pipe: KbqPipe) {
        this.filter?.pipes.splice(this.filter?.pipes.indexOf(pipe), 1);

        this.onRemovePipe.next(pipe);
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
}
