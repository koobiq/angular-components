import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';

/**
 * @title Popover height
 */
@Component({
    standalone: true,
    selector: 'popover-height-example',
    templateUrl: 'popover-height-example.html',
    imports: [KbqFormFieldModule, KbqInputModule, KbqButtonModule, KbqPopoverModule, KbqFormsModule],
    styles: `
        >>> .kbq-popover.popover-height-custom-example .kbq-popover__container {
            max-height: 240px;
        }

        >>> .kbq-popover.popover-height-custom-example .kbq-popover__header {
            flex-shrink: 0;
        }
    `
})
export class PopoverHeightExample {
    activePopover: KbqPopoverTrigger;
}
