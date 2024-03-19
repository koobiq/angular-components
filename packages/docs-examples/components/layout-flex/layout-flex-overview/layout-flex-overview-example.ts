import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Flex layout
 */
@Component({
    selector: 'layout-flex-overview-example',
    templateUrl: 'layout-flex-overview-example.html',
    styleUrls: ['layout-flex-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class LayoutFlexOverviewExample {
    layoutDirection: string = 'layout-column';
}
