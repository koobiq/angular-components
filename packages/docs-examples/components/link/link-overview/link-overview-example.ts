import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Basic link
 */
@Component({
    selector: 'link-overview-example',
    templateUrl: 'link-overview-example.html',
    styleUrls: ['link-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class LinkOverviewExample {
    active = true;
    focus = true;
    disabled = true;
}
