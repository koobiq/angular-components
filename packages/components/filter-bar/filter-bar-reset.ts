import { Component, inject } from '@angular/core';
import { KbqButtonModule } from '../button';
import { KbqFilterBar } from './filter-bar';

@Component({
    standalone: true,
    selector: 'kbq-filter-reset',
    template: `
        <button [color]="'theme'" [kbqStyle]="'transparent'" (click)="handleClick()" kbq-button>
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

    handleClick() {
        this.filterBar.resetFilterChangedState();

        this.filterBar.onReset.next(this.filterBar.activeFilter);
        this.filterBar.changes.next();
    }
}
