import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip arrow
 */
@Component({
    selector: 'tooltip-arrow-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button kbq-button kbqTooltip="Tooltip without arrow">No arrow</button>
        <button kbq-button kbqTooltip="Tooltip with arrow" [kbqTooltipArrow]="true">With arrow</button>
        <button
            kbq-button
            kbqTooltip="Tooltip with centered arrow"
            kbqPlacement="bottomRight"
            [kbqTooltipArrow]="true"
            [kbqTooltipArrowCentered]="true"
        >
            Centered arrow
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    }
})
export class TooltipArrowExample {}
