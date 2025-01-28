import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { BehaviorSubject, merge } from 'rxjs';
import { KbqDividerModule } from '../divider';
import { KbqFilter, KbqPipe, KbqPipeTemplate } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    template: `
        <div class="kbq-filter-bar__left">
            <ng-content select="kbq-filters" />

            @if (activeFilter?.saved) {
                <i [color]="'theme'" kbq-icon="kbq-chevron-right-s_16"></i>
            } @else {
                <kbq-divider class="kbq-filter-bar__separator" [vertical]="true" />
            }

            <ng-content />

            <ng-content select="kbq-pipe-add" />

            @if (activeFilter?.changed) {
                <ng-content select="kbq-filter-reset" />
            }
        </div>

        <div class="kbq-filter-bar__right">
            <ng-content select="kbq-filter-bar-search, [kbq-filter-bar-search]" />

            <!--            <kbq-divider class="kbq-filter-bar__separator" [vertical]="true" />-->

            <ng-content select="kbq-filter-bar-refresher, [kbq-filter-bar-refresher]" />
        </div>
    `,
    styleUrls: ['filter-bar.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqDividerModule,
        KbqIcon
    ],
    host: {
        class: 'kbq-filter-bar'
    }
})
export class KbqFilterBar {
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    private savedFilter: KbqFilter | null = null;

    @Input()
    get activeFilter(): KbqFilter | null {
        return this._activeFilter;
    }

    set activeFilter(value: KbqFilter | null) {
        if (value && this.activeFilter === null) {
            this.saveFilterState(value);
        }

        this.activeFilterChanges.next(value);
    }

    private _activeFilter: KbqFilter | null;

    @Input()
    set pipeTemplates(value: KbqPipeTemplate[]) {
        this._templates = value;
    }

    get pipeTemplates(): KbqPipeTemplate[] {
        return this._templates;
    }

    private _templates: KbqPipeTemplate[];

    @Output() readonly onFilterChange = new EventEmitter<KbqFilter | null>();
    @Output() readonly onChangePipe = new EventEmitter<KbqPipe>();
    @Output() readonly onDeletePipe = new EventEmitter<KbqPipe>();

    readonly changes = new BehaviorSubject<void>(undefined);
    readonly activeFilterChanges = new BehaviorSubject<KbqFilter | null>(null);

    constructor() {
        this.activeFilterChanges.subscribe((filter) => {
            this._activeFilter = filter;

            this.onFilterChange.emit(this.activeFilter);
        });

        merge(this.onFilterChange, this.onChangePipe, this.onDeletePipe, this.activeFilterChanges).subscribe(() => {
            this.changes.next();
            this.changeDetectorRef.markForCheck();
        });
    }

    removePipe(pipe: KbqPipe) {
        this.activeFilter?.pipes.splice(this.activeFilter?.pipes.indexOf(pipe), 1);

        this.onDeletePipe.next(pipe);
    }

    saveFilterState(filter?: KbqFilter) {
        if (filter) {
            this.savedFilter = filter;
        } else if (this.activeFilter) {
            this.savedFilter = { ...this.activeFilter };
        }
    }

    restoreFilterState(filter?: KbqFilter) {
        if (filter) {
            this.activeFilter = filter;
        } else {
            this.activeFilter = this.savedFilter;
        }
    }

    resetFilterChangedState(filter?: KbqFilter) {
        if (filter) {
            this.activeFilter = filter;
        } else if (this.savedFilter) {
            this.activeFilter = { ...this.savedFilter, changed: false };
        }
    }
}
