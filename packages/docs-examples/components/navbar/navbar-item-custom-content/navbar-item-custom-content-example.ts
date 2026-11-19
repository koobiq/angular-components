import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqNavbarModule } from '@koobiq/components/navbar';

/**
 * @title Navbar item with custom content instead of the icon
 */
@Component({
    selector: 'navbar-item-custom-content-example',
    imports: [KbqNavbarModule],
    templateUrl: './navbar-item-custom-content-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarItemCustomContentExample {}
