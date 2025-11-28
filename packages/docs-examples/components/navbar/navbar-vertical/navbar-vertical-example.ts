import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Navbar vertical
 */
@Component({
    selector: 'navbar-vertical-example',
    imports: [
        KbqDropdownModule,
        KbqNavbarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    templateUrl: 'navbar-vertical-example.html',
    styles: `
        :host ::ng-deep .kbq-vertical-navbar__container {
            border-top-left-radius: 12px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalExample {
    readonly popUpPlacements = PopUpPlacements;
    readonly colors = KbqComponentColors;
}
