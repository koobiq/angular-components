import { Component, ViewEncapsulation } from '@angular/core';
import { KbqPopoverTrigger } from '@koobiq/components/popover';

/**
 * @title popover-scroll
 */
@Component({
    selector: 'popover-scroll-example',
    templateUrl: 'popover-scroll-example.html',
    styleUrls: ['popover-scroll-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverScrollExample {
    activePopover: KbqPopoverTrigger;
}
