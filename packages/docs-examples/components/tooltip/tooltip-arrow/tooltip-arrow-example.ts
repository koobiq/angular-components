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
        <div class="layout-row layout-align-center-center" style="min-height: 120px; gap: var(--kbq-size-l);">
            <button kbq-button kbqTooltip="Tooltip without arrow">No arrow</button>
            <button kbq-button kbqTooltip="Tooltip with arrow" [kbqTooltipArrow]="true">With arrow</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipArrowExample {}
