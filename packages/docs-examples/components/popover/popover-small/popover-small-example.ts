import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpSizes } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title popover-small
 */
@Component({
    selector: 'popover-small-example',
    imports: [
        KbqPopoverModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqIcon
    ],
    templateUrl: 'popover-small-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverSmallExample {
    popUpSizes = PopUpSizes;
}
