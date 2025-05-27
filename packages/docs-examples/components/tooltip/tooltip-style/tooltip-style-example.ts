import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip style
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tooltip-style-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <div class="layout-row layout-wrap" style="gap: 16px">
            <button
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Contrast"
                kbq-button
                kbqTooltip="Тултип"
            >
                {{ buttonText }}
            </button>

            <button
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.ContrastFade"
                kbq-button
                kbqTooltip="Тултип"
            >
                {{ buttonText }}
            </button>

            <button
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Error"
                kbq-button
                kbqTooltip="Тултип"
            >
                {{ buttonText }}
            </button>

            <button
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Warning"
                kbq-button
                kbqTooltip="Тултип"
            >
                {{ buttonText }}
            </button>

            <button
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Theme"
                kbq-button
                kbqTooltip="Тултип"
            >
                {{ buttonText }}
            </button>
        </div>
    `
})
export class TooltipStyleExample {
    buttonText = 'Кнопка с тултипом';
    placement = PopUpPlacements.TopLeft;
    KbqComponentColors = KbqComponentColors;
}
