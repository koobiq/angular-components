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
import { KbqFilter, KbqPipe, KbqPipeTemplate, KbqSaveFilterError, KbqSaveFilterEvent } from './filter-bar.types';
import { KbqFilters } from './filters';

@Component({
    standalone: true,
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    template: `
        <div class="kbq-filter-bar__left">
            <ng-content select="kbq-filters" />

            <ng-content />

            <ng-content select="kbq-pipe-add" />

            @if (isChanged) {
                <ng-content select="kbq-filter-reset" />
            }
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

    @Input()
    get filter(): KbqFilter | null {
        return this._filter;
    }

    set filter(value: KbqFilter | null) {
        if (this._filter === value) return;

        if (value && this.filter === null) {
            this.saveFilterState(value);
        }

        this._filter = value;

        this.changes.next();
    }

    private _filter: KbqFilter | null;

    @Input()
    set pipeTemplates(value: KbqPipeTemplate[]) {
        this._templates = value;

        this.internalTemplatesChanges.next(this._templates);
    }

    get pipeTemplates(): KbqPipeTemplate[] {
        return this._templates;
    }

    private _templates: KbqPipeTemplate[] = [];

    @Output() readonly filterChange = new EventEmitter<KbqFilter | null>();
    @Output() readonly onChangePipe = new EventEmitter<KbqPipe>();
    @Output() readonly onDeletePipe = new EventEmitter<KbqPipe>();

    @Output() readonly onSelectFilter = new EventEmitter<KbqFilter>();
    @Output() readonly onSave = new EventEmitter<KbqSaveFilterEvent>();
    @Output() readonly onChangeFilter = new EventEmitter<KbqSaveFilterEvent>();
    @Output() readonly onSaveAsNew = new EventEmitter<KbqSaveFilterEvent>();
    @Output() readonly onDeleteFilter = new EventEmitter<KbqFilter>();
    @Output() readonly onResetFilter = new EventEmitter<KbqFilter | null>();

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

        merge(this.onChangePipe, this.onDeletePipe).subscribe(() => {
            if (this.filter) {
                this.filter.changed = true;
            }

            this.filterChange.emit(this.filter);
        });

        merge(this.filterChange, this.onChangePipe, this.onDeletePipe, this.internalFilterChanges).subscribe(() => {
            this.changes.next();
            this.changeDetectorRef.markForCheck();
        });
    }

    removePipe(pipe: KbqPipe) {
        this.filter?.pipes.splice(this.filter?.pipes.indexOf(pipe), 1);

        this.onDeletePipe.next(pipe);
    }

    saveFilterState(filter?: KbqFilter) {
        this.savedFilter = structuredClone(filter ?? this.filter);
    }

    restoreFilterState(filter?: KbqFilter) {
        this.filter = structuredClone(filter ?? this.savedFilter);
    }

    resetFilterChangedState() {
        this.filter!.changed = false;
    }

    filterSavedSuccessfully() {
        this.filters.popover.hide();
        this.filters.restoreFocus();
    }

    filterSavedUnsuccessfully(error?: KbqSaveFilterError) {
        this.filters.showError(error);
    }

    resetFilterState(filter?: KbqFilter) {
        this.restoreFilterState(filter);
        this.resetFilterChangedState();

        this.onResetFilter.emit(this.filter!);
        this.internalFilterChanges.next(this.filter!);
    }
}
