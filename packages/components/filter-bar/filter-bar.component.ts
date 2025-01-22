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
import { BehaviorSubject } from 'rxjs';
import { KbqDividerModule } from '../divider';
import { KbqFilter, KbqPipe, KbqPipeTemplate } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    template: `
        <div class="kbq-filter-bar__left">
            <ng-content select="kbq-filters" />

            <kbq-divider class="kbq-filter-bar__separator" [vertical]="true" />

            <ng-content />

            <ng-content select="kbq-pipe-add" />

            @if (activeFilter?.changed) {
                <ng-content select="kbq-filter-reset" />
            }
        </div>

        <ng-content select="kbq-filter-bar-actions, [kbq-filter-bar-actions]" />
    `,
    styleUrls: ['filter-bar.component.scss', 'filter-bar-tokens.scss'],
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
    private savedFilter: KbqFilter;

    @Input() filters: KbqFilter[];

    @Input()
    get activeFilter(): KbqFilter | null {
        return this._activeFilter;
    }

    set activeFilter(value: KbqFilter | null) {
        if (value && this.activeFilter === null) {
            console.log('value && this.activeFilter === null: ');
            this.saveFilterState(value);
        }

        this._activeFilter = value;

        this.changeDetectorRef.markForCheck();
    }

    private _activeFilter: KbqFilter | null;

    @Input()
    set templates(value: KbqPipeTemplate[]) {
        this._templates = value;
    }

    get templates(): KbqPipeTemplate[] {
        return this._templates;
    }

    private _templates: KbqPipeTemplate[];

    @Output() readonly onFilterChange = new EventEmitter<KbqFilter | null>();
    @Output() readonly onSelectFilter = new EventEmitter<void>();
    @Output() readonly onAddFilter = new EventEmitter<void>();
    @Output() readonly onAddPipe = new EventEmitter<KbqPipeTemplate>();
    @Output() readonly onSaveFilter = new EventEmitter<void>();
    @Output() readonly onReset = new EventEmitter<KbqFilter | null>();

    readonly activeFilterChanges = new BehaviorSubject<KbqFilter | null>(null);

    constructor() {
        this.activeFilterChanges.subscribe((filter) => {
            this._activeFilter = filter;

            this.onFilterChange.emit(this.activeFilter);
        });
    }

    applyPipe(pipe: KbqPipe) {
        console.log('need apply pipe: ', pipe);
    }

    removePipe(pipe: KbqPipe) {
        this.activeFilter?.pipes.splice(this.activeFilter?.pipes.indexOf(pipe), 1);

        this.changeDetectorRef.detectChanges();
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

    resetFilterState(filter?: KbqFilter) {
        if (filter) {
            this.activeFilter = filter;
        } else {
            this.activeFilter = { ...this.savedFilter, changed: false };
        }
    }
}
