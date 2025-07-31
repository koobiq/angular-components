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
                kbq-button
                kbqTooltip="Тултип"
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Contrast"
            >
                {{ buttonText }}
            </button>

            <button
                kbq-button
                kbqTooltip="Тултип"
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.ContrastFade"
            >
                {{ buttonText }}
            </button>

            <button
                kbq-button
                kbqTooltip="Тултип"
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Error"
            >
                {{ buttonText }}
            </button>

            <button
                kbq-button
                kbqTooltip="Тултип"
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Warning"
            >
                {{ buttonText }}
            </button>

            <button
                kbq-button
                kbqTooltip="Тултип"
                [kbqPlacement]="placement"
                [kbqTooltipColor]="KbqComponentColors.Theme"
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
