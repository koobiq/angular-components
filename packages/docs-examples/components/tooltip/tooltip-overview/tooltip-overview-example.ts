import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tooltip-overview-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <div class="layout-column" style="gap: 16px; align-items: flex-start">
            <button kbq-button kbqTooltip="Тултип" [kbqPlacement]="placement">Кнопка с тултипом</button>
            <button kbq-button kbqWarningTooltip="Тултип" [kbqPlacement]="placement">Кнопка с предупреждением</button>
        </div>
    `
})
export class TooltipOverviewExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
