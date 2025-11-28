import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';

/**
 * @title Popover placement center
 */
@Component({
    selector: 'popover-placement-center-example',
    imports: [KbqFormFieldModule, KbqInputModule, KbqButtonModule, KbqPopoverModule],
    templateUrl: 'popover-placement-center-example.html',
    styles: `
        .popover-placement-center-example {
            display: flex;
            column-gap: 16px;
        }

        .popover-placement-center-example__column {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
        }

        .popover-placement-center-example__column button {
            width: 100%;
        }

        .popover-placement-center-example__column button + button {
            margin-top: 48px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverPlacementCenterExample {
    placements = PopUpPlacements;
    activePopover: KbqPopoverTrigger;
}
