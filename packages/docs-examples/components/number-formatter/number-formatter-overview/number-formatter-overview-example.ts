import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Basic progress number-formatter
 */
@Component({
    selector: 'number-formatter-overview-example',
    templateUrl: 'number-formatter-overview-example.html',
    styleUrls: ['number-formatter-overview-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class NumberFormatterOverviewExample {
    value = 1000.123;
}
