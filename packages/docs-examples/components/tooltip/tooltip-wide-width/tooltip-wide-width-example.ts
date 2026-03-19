import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip wide width
 */
@Component({
    selector: 'tooltip-wide-width-example',
    imports: [KbqToolTipModule],
    template: `
        <span
            kbqTooltip="9f1c2e4a8b7d3f6c5e2a1d9b0c4e7f8a6d3c2b1a9e8f7d6c5b4a3e2d1c0f9a8"
            [kbqTooltipClass]="'example__wide-tooltip'"
        >
            9f1c...f9a8
        </span>
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center layout-gap-l'
    },
    styles: `
        ::ng-deep .example__wide-tooltip.kbq-tooltip {
            --kbq-tooltip-size-max-width: 454px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipWideWidthExample {}
