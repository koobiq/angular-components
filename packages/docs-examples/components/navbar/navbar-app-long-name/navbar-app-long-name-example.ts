import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Navbar app long name
 */
@Component({
    selector: 'navbar-app-long-name-example',
    imports: [
        KbqDividerModule,
        KbqNavbarModule,
        KbqButtonModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqToolTipModule
    ],
    templateUrl: 'navbar-app-long-name-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarAppLongNameExample {
    popUpPlacements = PopUpPlacements;
}
