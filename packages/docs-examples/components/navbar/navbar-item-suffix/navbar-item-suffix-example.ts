import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';

/**
 * @title Navbar item with an icon after the title
 */
@Component({
    selector: 'navbar-item-suffix-example',
    imports: [KbqNavbarModule, KbqIconModule],
    templateUrl: 'navbar-item-suffix-example.html',
    styles: `
        :host ::ng-deep .kbq-vertical-navbar__container {
            border-bottom-left-radius: 12px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarItemSuffixExample {}
