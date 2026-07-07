import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqFilterBar } from './filter-bar';
import { KBQ_FILTER_BAR_DEFAULT_CONFIGURATION } from './filter-bar.types';

@Component({
    selector: 'kbq-filter-refresher, [kbq-filter-refresher]',
    imports: [
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <button
            kbq-button
            [color]="'contrast'"
            [kbqStyle]="'transparent'"
            [attr.aria-label]="localeData.refresher.refresh"
        >
            <i kbq-icon="kbq-arrow-rotate-right_16" aria-hidden="true"></i>
        </button>
        <button
            kbq-button
            [color]="'contrast'"
            [kbqStyle]="'transparent'"
            [attr.aria-label]="localeData.refresher.settings"
        >
            <i kbq-icon="kbq-chevron-down_16" aria-hidden="true"></i>
        </button>
    `,
    styleUrls: ['filter-refresher.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filter-refresher'
    }
})
export class KbqFilterRefresher {
    /** KbqFilterBar instance */
    private readonly filterBar = inject(KbqFilterBar, { optional: true });

    /** localized data
     * @docs-private */
    protected get localeData() {
        return this.filterBar?.configuration ?? KBQ_FILTER_BAR_DEFAULT_CONFIGURATION;
    }
}
