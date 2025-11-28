import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';

/**
 * @title Popover height
 */
@Component({
    selector: 'popover-height-example',
    imports: [KbqFormFieldModule, KbqInputModule, KbqButtonModule, KbqPopoverModule, KbqFormsModule],
    templateUrl: 'popover-height-example.html',
    styles: `
        ::ng-deep .kbq-popover.popover-height-custom-example .kbq-popover__container {
            max-height: 240px;
        }

        ::ng-deep .kbq-popover.popover-height-custom-example .kbq-popover__header {
            flex-shrink: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverHeightExample {
    activePopover: KbqPopoverTrigger;
}
