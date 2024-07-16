import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Splitter with dynamic data
 */
@Component({
    selector: 'splitter-dynamic-data-example',
    templateUrl: 'splitter-dynamic-data-example.html',
    styleUrls: ['splitter-dynamic-data-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SplitterDynamicDataExample {
    isFirstVisible = true;
}
