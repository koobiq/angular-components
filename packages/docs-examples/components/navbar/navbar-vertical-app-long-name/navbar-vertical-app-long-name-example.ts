import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Navbar vertical app long name
 */
@Component({
    selector: 'navbar-vertical-app-long-name-example',
    imports: [
        KbqNavbarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    templateUrl: 'navbar-vertical-app-long-name-example.html',
    styles: `
        :host ::ng-deep .kbq-vertical-navbar__container {
            border-top-left-radius: 12px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalAppLongNameExample {
    readonly popUpPlacements = PopUpPlacements;
    readonly colors = KbqComponentColors;
    readonly appName = 'Super Long Menu Title with Line Wrap and Ellipsis Truncation';
}
