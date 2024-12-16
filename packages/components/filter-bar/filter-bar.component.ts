import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    EventEmitter, inject,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KbqFilter, KbqPipe, KbqPipeTemplate } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-bar, [kbq-filter-bar]',
    template: `
        <div class="kbq-filter-bar__left">
            <ng-content />
        </div>

        <ng-content select="kbq-filter-bar-actions, [kbq-filter-bar-actions]" />
    `,
    styleUrls: ['filter-bar.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filter-bar'
    }
})
export class KbqFilterBar {
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    @Input() filters: KbqFilter[];

    @Input()
    get activeFilter(): KbqFilter | null {
        return this._activeFilter;
    }

    set activeFilter(value: KbqFilter | null) {
        this._activeFilter = value;

        this.changeDetectorRef.markForCheck();
    }

    private _activeFilter: KbqFilter | null;

    templates: KbqPipeTemplate[];

    @Output() readonly changes: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onSelectFilter: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onAddFilter: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onAddPipe: EventEmitter<KbqPipeTemplate> = new EventEmitter<KbqPipeTemplate>();
    @Output() readonly onSaveFilter: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onSaveReset: EventEmitter<void> = new EventEmitter<void>();

    readonly activeFilterChanges = new BehaviorSubject<KbqFilter | null>(null);

    constructor() {
        this.activeFilterChanges.subscribe((filter) => {
            this._activeFilter = filter;
        });

        this.onAddPipe.subscribe((pipe: KbqPipe) => {
            // this.activeFilter?.pipes.push(pipe);
            console.log('onAddPipe: ', pipe);
        });
    }
}
