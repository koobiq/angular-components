import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip placement center
 */
@Component({
    selector: 'tooltip-placement-center-example',
    imports: [KbqToolTipModule],
    template: `
        <div class="example-tooltip__visual-box">
            @for (placement of placements; track placement) {
                <div
                    class="example-tooltip__trigger example-tooltip__trigger_{{ placement }}"
                    [kbqPlacement]="placement"
                    [kbqTooltip]="getText(placement)"
                ></div>
            }
        </div>
    `,
    styleUrls: ['tooltip-placement-center-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipPlacementCenterExample {
    placements = [PopUpPlacements.Top, PopUpPlacements.Right, PopUpPlacements.Bottom, PopUpPlacements.Left];

    getText(placement: PopUpPlacements): string {
        return `kbqPlacement: ${placement}`;
    }
}
