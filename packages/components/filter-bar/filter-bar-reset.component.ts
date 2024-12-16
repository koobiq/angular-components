import { Component, EventEmitter, inject, Output } from '@angular/core';
import { KbqButtonModule } from '../button';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilter } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-reset',
    template: `
        <button
            [color]="'theme'"
            [kbqStyle]="'transparent'"
            (click)="onResetActiveFilter.next(this.filterBar.activeFilter)"
            kbq-button
        >
            <ng-content />
        </button>
    `,
    host: {
        class: 'kbq-filter-bar-reset'
    },
    imports: [
        KbqButtonModule
    ]
})
export class KbqFilterReset {
    protected readonly filterBar = inject(KbqFilterBar);

    @Output() onResetActiveFilter = new EventEmitter<KbqFilter | null>();
}
