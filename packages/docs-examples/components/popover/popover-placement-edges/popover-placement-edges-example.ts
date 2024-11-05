import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';

/**
 * @title Popover placement edges
 */
@Component({
    standalone: true,
    selector: 'popover-placement-edges-example',
    templateUrl: 'popover-placement-edges-example.html',
    imports: [
        KbqPopoverModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    styles: `
        :host {
            .popover-placement-edges-example {
                display: flex;
                column-gap: 16px;
            }

            .popover-placement-edges-example__column {
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: 100%;
            }

            .popover-placement-edges-example__column button {
                width: 100%;
            }

            .popover-placement-edges-example__column button + button {
                margin-top: 52px;
            }

            .popover-placement-edges-example__column.middle button + button {
                margin-top: 136px;
            }
        }
    `
})
export class PopoverPlacementEdgesExample {
    placements = PopUpPlacements;
    activePopover: KbqPopoverTrigger;
}
