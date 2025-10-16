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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'popover-small-example',
    templateUrl: 'popover-small-example.html',
    imports: [
        KbqPopoverModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqIcon
    ]
})
export class PopoverSmallExample {
    popUpSizes = PopUpSizes;
}
