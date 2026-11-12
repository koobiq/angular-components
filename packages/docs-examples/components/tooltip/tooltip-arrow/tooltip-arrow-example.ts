import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
        <button kbq-button [kbqTooltip]="t().tooltipWithoutArrow">{{ t().noArrow }}</button>
        <button kbq-button kbqPlacement="bottomRight" [kbqTooltip]="t().tooltipWithArrow" [kbqTooltipArrow]="true">
            {{ t().withArrow }}
        </button>
        <button
            kbq-button
            kbqPlacement="bottomRight"
            [kbqTooltip]="t().tooltipWithCenteredArrow"
            [kbqTooltipArrow]="true"
            [kbqTooltipArrowCentered]="true"
        >
            {{ t().centeredArrow }}
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    }
})
export class TooltipArrowExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
