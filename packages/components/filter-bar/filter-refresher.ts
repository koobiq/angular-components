import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    standalone: true,
    selector: 'kbq-filter-refresher, [kbq-filter-refresher]',
    template: `
        <button kbq-button [color]="'contrast'" [kbqStyle]="'transparent'">
            <i kbq-icon="kbq-arrow-rotate-right_16"></i>
        </button>
        <button kbq-button [color]="'contrast'" [kbqStyle]="'transparent'">
            <i kbq-icon="kbq-chevron-down_16"></i>
        </button>
    `,
    styleUrls: ['filter-refresher.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonModule,
        KbqIconModule
    ],
    host: {
        class: 'kbq-filter-refresher'
    }
})
export class KbqFilterBarRefresher {}
