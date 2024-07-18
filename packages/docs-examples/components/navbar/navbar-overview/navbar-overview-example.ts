import { Component, ViewEncapsulation } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title Navbar
 */
@Component({
    selector: 'navbar-overview-example',
    templateUrl: 'navbar-overview-example.html',
    styleUrls: ['navbar-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarOverviewExample {
    popUpPlacements = PopUpPlacements;
}
