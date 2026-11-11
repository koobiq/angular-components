import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from './l10n';

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
        <button kbq-button [kbqTooltip]="text().tooltipWithoutArrow">{{ text().noArrow }}</button>
        <button kbq-button kbqPlacement="bottomRight" [kbqTooltip]="text().tooltipWithArrow" [kbqTooltipArrow]="true">
            {{ text().withArrow }}
        </button>
        <button
            kbq-button
            kbqPlacement="bottomRight"
            [kbqTooltip]="text().tooltipWithCenteredArrow"
            [kbqTooltipArrow]="true"
            [kbqTooltipArrowCentered]="true"
        >
            {{ text().centeredArrow }}
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    }
})
export class TooltipArrowExample {
    protected readonly text = injectExampleText();
}
