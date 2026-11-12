import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqListModule } from '@koobiq/components/list';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title popover-paddings
 */
@Component({
    selector: 'popover-paddings-example',
    imports: [
        KbqPopoverModule,
        KbqButtonModule,
        KbqListModule
    ],
    templateUrl: 'popover-paddings-example.html',
    styles: `
        ::ng-deep .popover-custom-paddings-example .kbq-popover__content {
            margin: 4px;
            width: 376px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverPaddingsExample {
    popUpSizes = PopUpSizes;
    popUpPlacements = PopUpPlacements;
}
