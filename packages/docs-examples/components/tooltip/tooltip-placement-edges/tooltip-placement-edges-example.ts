import { Component } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip placement edges
 */
@Component({
    standalone: true,
    selector: 'tooltip-placement-edges-example',
    styleUrls: ['tooltip-placement-edges-example.css'],
    imports: [KbqToolTipModule],
    template: `
        <div class="tooltip-example__visual-box">
            @for (placement of placements; track placement) {
                <div
                    class="tooltip-example__trigger tooltip-example__trigger_{{ placement }}"
                    [kbqPlacement]="placement"
                    [kbqTooltip]="'Tooltip\\nkbqPlacement: ' + placement"
                ></div>
            }
        </div>
    `
})
export class TooltipPlacementEdgesExample {
    placements = [
        PopUpPlacements.TopLeft,
        PopUpPlacements.TopRight,
        PopUpPlacements.BottomLeft,
        PopUpPlacements.BottomRight,
        PopUpPlacements.LeftBottom,
        PopUpPlacements.LeftTop,
        PopUpPlacements.RightBottom,
        PopUpPlacements.RightTop
    ];
}
