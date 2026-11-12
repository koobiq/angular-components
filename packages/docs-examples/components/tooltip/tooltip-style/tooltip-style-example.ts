import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipColor]="KbqComponentColors.Contrast">
            Contrast (default)
        </button>

        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipColor]="KbqComponentColors.ContrastFade">
            Contrast Fade
        </button>

        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipColor]="KbqComponentColors.Error">Error</button>

        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipColor]="KbqComponentColors.Warning">Warning</button>

        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipColor]="KbqComponentColors.Theme">Theme</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    }
})
export class TooltipStyleExample extends BaseLocalizedExample<ExampleText> {
    KbqComponentColors = KbqComponentColors;

    constructor() {
        super(TEXT);
    }
}
