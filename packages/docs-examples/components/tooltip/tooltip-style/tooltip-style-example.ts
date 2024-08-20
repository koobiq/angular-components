import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Tooltip Style
 */
@Component({
    selector: 'tooltip-style-example',
    templateUrl: 'tooltip-style-example.html',
    styleUrls: ['tooltip-style-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipStyleExample {
    buttonText = 'Кнопка с тултипом';
    placement = PopUpPlacements.TopLeft;
    KbqComponentColors = KbqComponentColors;
}
