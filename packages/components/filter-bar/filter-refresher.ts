import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'kbq-filter-refresher, [kbq-filter-refresher]',
    imports: [
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <button kbq-button [color]="'contrast'" [kbqStyle]="'transparent'">
            <i kbq-icon="kbq-arrow-rotate-right_16"></i>
        </button>
        <button kbq-button [color]="'contrast'" [kbqStyle]="'transparent'">
            <i kbq-icon="kbq-chevron-down_16"></i>
        </button>
    `,
    styleUrls: ['filter-refresher.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-filter-refresher'
    }
})
export class KbqFilterBarRefresher {}
