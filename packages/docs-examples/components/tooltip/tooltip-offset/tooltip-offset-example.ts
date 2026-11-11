import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from './l10n';

/**
 * @title Tooltip offset
 */
@Component({
    selector: 'tooltip-offset-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button kbq-button [kbqTooltip]="text().tooltip">{{ text().default }}</button>
        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipArrow]="true">{{ text().defaultWithArrow }}</button>
        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipOffset]="0">0px</button>
        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipOffset]="32">32px</button>
        <button kbq-button [kbqTooltip]="text().tooltip" [kbqTooltipOffset]="-8">-8px</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    }
})
export class TooltipOffsetExample {
    protected readonly text = injectExampleText();
}
