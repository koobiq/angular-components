import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover Header
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'popover-header-example',
    templateUrl: 'popover-header-example.html',
    imports: [
        KbqDlModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqBadgeModule
    ]
})
export class PopoverHeaderExample {
    badgeColors = KbqBadgeColors;
}
