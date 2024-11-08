import { Component } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip placement center
 */
@Component({
    standalone: true,
    selector: 'tooltip-placement-center-example',
    styleUrls: ['tooltip-placement-center-example.css'],
    imports: [KbqToolTipModule],
    template: `
        <div class="tooltip-example__visual-box">
            @for (placement of placements; track placement) {
                <div
                    class="tooltip-example__trigger tooltip-example__trigger_{{ placement }}"
                    [kbqPlacement]="placement"
                    [kbqTooltip]="'kbqPlacement: ' + placement"
                ></div>
            }
        </div>
    `
})
export class TooltipPlacementCenterExample {
    placements = [PopUpPlacements.Top, PopUpPlacements.Right, PopUpPlacements.Bottom, PopUpPlacements.Left];
}
