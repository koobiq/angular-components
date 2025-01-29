import { Component, EventEmitter, inject, Output } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFilterBar } from './filter-bar';
import { KbqFilter } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-reset',
    template: `
        <button [color]="'theme'" [kbqStyle]="'transparent'" (click)="handleClick()" kbq-button>
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

    @Output() readonly onReset = new EventEmitter<KbqFilter>();

    handleClick() {
        this.filterBar.resetFilterChangedState();

        this.onReset.next(this.filterBar.activeFilter!);
    }
}
