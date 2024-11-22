import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip multiple lines
 */
@Component({
    standalone: true,
    selector: 'tooltip-multiple-lines-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button [kbqPlacement]="placement" kbq-button kbqTooltip="Подсказка может занимать две и более строк">
            Кнопка с тултипом
        </button>
    `
})
export class TooltipMultipleLinesExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
