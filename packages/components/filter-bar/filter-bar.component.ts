import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { KbqFilter } from './filter-bar.types';

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
    @Input() filters: KbqFilter[];
    @Input() activeFilter: KbqFilter;

    @Output() readonly changes: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onSelectFilter: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onAddFilter: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onSaveFilter: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly onSaveReset: EventEmitter<void> = new EventEmitter<void>();
}
