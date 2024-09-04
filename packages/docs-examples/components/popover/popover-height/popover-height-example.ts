import { Component, ViewEncapsulation } from '@angular/core';
import { KbqPopoverTrigger } from '@koobiq/components/popover';

/**
 * @title popover-height
 */
@Component({
    selector: 'popover-height-example',
    templateUrl: 'popover-height-example.html',
    styleUrls: ['popover-height-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverHeightExample {
    activePopover: KbqPopoverTrigger;
}
