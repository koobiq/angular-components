import { Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFilterBar } from './filter-bar';

@Component({
    standalone: true,
    selector: 'kbq-filter-reset',
    template: `
        <button [color]="'theme'" [kbqStyle]="'transparent'" (click)="filterBar.resetFilterState()" kbq-button>
            <ng-content>Сбросить</ng-content>
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
}
