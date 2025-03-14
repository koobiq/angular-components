import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    standalone: true,
    selector: 'kbq-filter-refresher, [kbq-filter-refresher]',
    template: `
        <button [color]="'contrast'" [kbqStyle]="'transparent'" kbq-button>
            <i kbq-icon="kbq-arrow-rotate-right_16"></i>
        </button>
        <button [color]="'contrast'" [kbqStyle]="'transparent'" kbq-button>
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
