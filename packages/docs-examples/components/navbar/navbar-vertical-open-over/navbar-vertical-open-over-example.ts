import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Vertical Navbar
 */
@Component({
    selector: 'navbar-vertical-open-over-example',
    templateUrl: 'navbar-vertical-open-over-example.html',
    styleUrls: ['navbar-vertical-open-over-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalOpenOverExample {
    popUpPlacements = PopUpPlacements;
}
