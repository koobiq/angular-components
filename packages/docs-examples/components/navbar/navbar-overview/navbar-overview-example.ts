import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Navbar
 */
@Component({
    selector: 'navbar-overview-example',
    imports: [
        KbqDropdownModule,
        KbqDividerModule,
        KbqNavbarModule,
        KbqButtonModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqToolTipModule
    ],
    templateUrl: 'navbar-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarOverviewExample {
    popUpPlacements = PopUpPlacements;
}
