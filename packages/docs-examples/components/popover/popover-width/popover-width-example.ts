import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpSizes } from '@koobiq/components/core';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover width
 */
@Component({
    standalone: true,
    selector: 'popover-width-example',
    templateUrl: 'popover-width-example.html',
    imports: [
        KbqPopoverModule,
        KbqButtonModule
    ],
    styles: `
        >>> .kbq-popover.popover-width-example p:first-child {
            margin-top: 0;
        }

        >>> .kbq-popover.popover-width-example p:last-child {
            margin-bottom: 0;
        }

        >>> .kbq-popover.kbq-popover_medium.popover-width-custom-example {
            max-width: 320px;
        }
    `
})
export class PopoverWidthExample {
    popUpSizes = PopUpSizes;
    selectedSize = PopUpSizes.Small;
}
