import { Component, EventEmitter, inject, Output } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFilterBar } from './filter-bar';
import { KbqFilter } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-reset',
    template: `
        <button [color]="'theme'" [kbqStyle]="'transparent'" (click)="onResetFilter.emit(filterBar.filter!)" kbq-button>
            <ng-content>{{ filterBar.configuration.reset.buttonName }}</ng-content>
        </button>
    `,
    host: {
        class: 'kbq-filter-bar-reset'
    },
    imports: [KbqButtonModule]
})
export class KbqFilterReset {
    protected readonly filterBar = inject(KbqFilterBar);

    /** Event that is generated whenever the user reset a filter. */
    @Output() readonly onResetFilter = new EventEmitter<KbqFilter | null>();
}
