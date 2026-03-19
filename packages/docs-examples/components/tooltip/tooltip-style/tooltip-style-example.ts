import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip style
 */
@Component({
    selector: 'tooltip-style-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipColor]="KbqComponentColors.Contrast">
            Contrast (default)
        </button>

        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipColor]="KbqComponentColors.ContrastFade">
            Contrast Fade
        </button>

        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipColor]="KbqComponentColors.Error">Error</button>

        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipColor]="KbqComponentColors.Warning">Warning</button>

        <button kbq-button kbqTooltip="Tooltip" [kbqTooltipColor]="KbqComponentColors.Theme">Theme</button>
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipStyleExample {
    KbqComponentColors = KbqComponentColors;
}
