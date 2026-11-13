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
            <button kbq-button type="button" kbqPlacement="topLeft" [kbqTooltip]="tooltipText" [kbqTooltipArrow]="true">
                topLeft
            </button>
            <button kbq-button type="button" kbqPlacement="top" [kbqTooltip]="tooltipText" [kbqTooltipArrow]="true">
                top
            </button>
            <button
                kbq-button
                type="button"
                kbqPlacement="topRight"
                [kbqTooltip]="tooltipText"
                [kbqTooltipArrow]="true"
            >
                topRight
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-space-between">
            <button kbq-button type="button" kbqPlacement="leftTop" [kbqTooltip]="tooltipText" [kbqTooltipArrow]="true">
                leftTop
            </button>
            <button
                kbq-button
                type="button"
                kbqPlacement="rightTop"
                [kbqTooltip]="tooltipText"
                [kbqTooltipArrow]="true"
            >
                rightTop
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-space-between">
            <button kbq-button type="button" kbqPlacement="left" [kbqTooltip]="tooltipText" [kbqTooltipArrow]="true">
                left
            </button>
            <button kbq-button type="button" kbqPlacement="right" [kbqTooltip]="tooltipText" [kbqTooltipArrow]="true">
                right
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-space-between">
            <button
                kbq-button
                type="button"
                kbqPlacement="leftBottom"
                [kbqTooltip]="tooltipText"
                [kbqTooltipArrow]="true"
            >
                leftBottom
            </button>
            <button
                kbq-button
                type="button"
                kbqPlacement="rightBottom"
                [kbqTooltip]="tooltipText"
                [kbqTooltipArrow]="true"
            >
                rightBottom
            </button>
        </div>

        <br />

        <div class="layout-row layout-gap-l layout-align-center-center">
            <button
                kbq-button
                type="button"
                kbqPlacement="bottomLeft"
                [kbqTooltip]="tooltipText"
                [kbqTooltipArrow]="true"
            >
                bottomLeft
            </button>
            <button kbq-button type="button" kbqPlacement="bottom" [kbqTooltip]="tooltipText" [kbqTooltipArrow]="true">
                bottom
            </button>
            <button
                kbq-button
                type="button"
                kbqPlacement="bottomRight"
                [kbqTooltip]="tooltipText"
                [kbqTooltipArrow]="true"
            >
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
