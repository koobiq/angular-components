import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFilterBar } from './filter-bar';
import { KbqFilter } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filter-reset',
    template: `
        <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'" (click)="resetFilter()">
            <ng-content>{{ localeData }}</ng-content>
        </button>
    `,
    host: {
        class: 'kbq-filter-reset'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [KbqButtonModule]
})
export class KbqFilterReset {
    /** KbqFilterBar instance */
    private readonly filterBar = inject(KbqFilterBar);

    /** Event that is generated whenever the user reset a filter. */
    @Output() readonly onResetFilter = new EventEmitter<KbqFilter | null>();

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar.configuration.reset.buttonName;
    }

    protected resetFilter() {
        this.onResetFilter.emit(this.filterBar.filter!);

        this.filterBar.changes.next();
        this.filterBar.onResetFilter.next(true);
    }
}
