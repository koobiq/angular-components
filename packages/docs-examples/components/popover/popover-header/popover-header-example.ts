import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover Header
 */
@Component({
    selector: 'popover-header-example',
    imports: [
        KbqDlModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqBadgeModule
    ],
    templateUrl: 'popover-header-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverHeaderExample {
    badgeColors = KbqBadgeColors;
}
