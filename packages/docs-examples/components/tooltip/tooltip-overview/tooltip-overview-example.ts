import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip
 */
@Component({
    standalone: true,
    selector: 'tooltip-overview-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <div
            class="layout-column"
            style="gap: 16px; align-items: flex-start"
        >
            <button
                [kbqPlacement]="placement"
                kbq-button
                kbqTooltip="Тултип"
            >
                Кнопка с тултипом
            </button>
            <button
                [kbqPlacement]="placement"
                kbq-button
                kbqWarningTooltip="Тултип"
            >
                Кнопка с предупреждением
            </button>
        </div>
    `
})
export class TooltipOverviewExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
