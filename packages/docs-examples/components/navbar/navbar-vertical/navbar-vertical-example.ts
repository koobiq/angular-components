import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Vertical Navbar
 */
@Component({
    selector: 'navbar-vertical-example',
    templateUrl: 'navbar-vertical-example.html',
    styleUrls: ['navbar-vertical-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class NavbarVerticalExample {
    popUpPlacements = PopUpPlacements;
}
