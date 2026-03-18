import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip placements
 */
@Component({
    selector: 'tooltip-placements-example',
    imports: [KbqToolTipModule, KbqButtonModule],
    template: `
        <div class="layout-row layout-gap-l layout-align-center-center">
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'topLeft'" [kbqTooltipArrow]="true">
                topLeft
            </button>
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'top'" [kbqTooltipArrow]="true">
                top
            </button>
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'topRight'" [kbqTooltipArrow]="true">
                topRight
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-space-between">
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'leftTop'" [kbqTooltipArrow]="true">
                leftTop
            </button>
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'rightTop'" [kbqTooltipArrow]="true">
                rightTop
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-space-between">
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'left'" [kbqTooltipArrow]="true">
                left
            </button>
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'right'" [kbqTooltipArrow]="true">
                right
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-space-between">
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'leftBottom'" [kbqTooltipArrow]="true">
                leftBottom
            </button>
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'rightBottom'" [kbqTooltipArrow]="true">
                rightBottom
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-center-center">
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'bottomLeft'" [kbqTooltipArrow]="true">
                bottomLeft
            </button>
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'bottom'" [kbqTooltipArrow]="true">
                bottom
            </button>
            <button kbqTooltip="{{ tooltipText }}" kbq-button [kbqPlacement]="'bottomRight'" [kbqTooltipArrow]="true">
                bottomRight
            </button>
        </div>
    `,
    styles: `
        :host {
            display: block;

            max-width: 734px;
            margin: 0 auto;

            .kbq-button {
                width: 134px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipPlacementsExample {
    tooltipText =
        'A tooltip is a hint that appears when the pointer hovers over or focuses on an interface element. A tooltip cannot contain interactive elements.';
}
