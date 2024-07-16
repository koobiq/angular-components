import { Component, ViewEncapsulation } from '@angular/core';
import { Direction } from '@koobiq/components/splitter';

/**
 * @title Basic Splitter
 */
@Component({
    selector: 'splitter-nested-example',
    templateUrl: 'splitter-nested-example.html',
    styleUrls: ['splitter-nested-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SplitterNestedExample {
    direction = Direction;
}
