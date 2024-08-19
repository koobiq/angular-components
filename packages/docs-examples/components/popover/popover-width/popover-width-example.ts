import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpSizes } from '@koobiq/components/core';

/**
 * @title popover-width
 */
@Component({
    selector: 'popover-width-example',
    templateUrl: 'popover-width-example.html',
    styleUrls: ['popover-width-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverWidthExample {
    popUpSizes = PopUpSizes;
    selectedSize = PopUpSizes.Small;
}
