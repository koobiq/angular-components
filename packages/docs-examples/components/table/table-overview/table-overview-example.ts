import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Basic Table
 */
@Component({
    selector: 'table-overview-example',
    templateUrl: 'table-overview-example.html',
    styleUrls: ['table-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TableOverviewExample {
    protected readonly colors = KbqComponentColors;
}
