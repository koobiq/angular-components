import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_FILTER_BAR_HOST, KbqFilter } from './filter-bar.types';

@Component({
    selector: 'kbq-filter-reset',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'" (click)="resetFilter()">
            <ng-content>{{ localeData }}</ng-content>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-filter-reset'
    }
})
export class KbqFilterReset {
    /** KbqFilterBar host seam */
    private readonly filterBar = inject(KBQ_FILTER_BAR_HOST);

    /** Event that is generated whenever the user reset a filter. */
    readonly onResetFilter = output<KbqFilter | null>();

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar.configuration.reset.buttonName;
    }

    protected resetFilter() {
        this.onResetFilter.emit(this.filterBar.filter()!);

        this.filterBar.onResetFilter.next(true);
    }
}
