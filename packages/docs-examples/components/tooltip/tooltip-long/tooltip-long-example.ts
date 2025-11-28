import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip long
 */
@Component({
    selector: 'tooltip-long-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button
            kbq-button
            kbqTooltip="efa761fe-ee12-4c77-a0fb-8ecc70f4a79b-a53316a9-1180-4283-a86c"
            kbqTooltipClass="long-tooltip"
        >
            Кнопка с длинным тултипом
        </button>
    `,
    styles: `
        .long-tooltip {
            max-width: none !important;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipLongExample {}
