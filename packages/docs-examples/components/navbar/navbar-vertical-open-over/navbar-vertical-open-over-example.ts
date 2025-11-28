import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Navbar vertical open over
 */
@Component({
    selector: 'navbar-vertical-open-over-example',
    imports: [
        KbqDropdownModule,
        KbqNavbarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    templateUrl: 'navbar-vertical-open-over-example.html',
    styles: `
        :host::ng-deep.kbq-vertical-navbar__container {
            border-top-left-radius: 12px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalOpenOverExample {
    popUpPlacements = PopUpPlacements;
}
