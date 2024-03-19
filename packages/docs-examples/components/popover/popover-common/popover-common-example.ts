import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title popover-common
 */
@Component({
    selector: 'popover-common-example',
    templateUrl: 'popover-common-example.html',
    styleUrls: ['popover-common-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverCommonExample {
    ELEMENTS = {
        BUTTON: 'button',
        LINK: 'link'
    };
    selectedElement: string = this.ELEMENTS.BUTTON;
}
