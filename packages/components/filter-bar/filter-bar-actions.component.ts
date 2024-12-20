import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '../icon';

@Component({
    standalone: true,
    selector: 'kbq-filter-bar-actions, [kbq-filter-bar-actions]',
    template: `
        <button [color]="'contrast'" [kbqStyle]="'transparent'" kbq-button>
            <i kbq-icon="kbq-magnifying-glass_16"></i>
        </button>

        <kbq-divider [vertical]="true" />

        <button [color]="'contrast'" [kbqStyle]="'transparent'" kbq-button>
            <i kbq-icon="kbq-arrow-rotate-right_16"></i>
        </button>
        <button [color]="'contrast'" [kbqStyle]="'transparent'" kbq-button>
            <i kbq-icon="kbq-chevron-down_16"></i>
        </button>
    `,
    styleUrls: ['filter-bar-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqDividerModule,
        KbqButtonModule,
        KbqIconModule
    ],
    host: {
        class: 'kbq-filter-bar-actions'
    }
})
export class KbqFilterBarActions {}
