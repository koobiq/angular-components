import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from '../l10n';

/**
 * @title Tooltip width
 */
@Component({
    selector: 'tooltip-width-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button kbq-button [kbqTooltip]="text().tooltip">Tooltip</button>
        <button kbq-button [kbqTooltip]="text().longTooltip">Max Width</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    }
})
export class TooltipWidthExample {
    protected readonly text = injectExampleText();

    placement: PopUpPlacements = PopUpPlacements.Top;
}
