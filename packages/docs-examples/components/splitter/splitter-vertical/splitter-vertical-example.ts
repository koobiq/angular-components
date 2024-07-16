import { Component, ViewEncapsulation } from '@angular/core';
import { Direction } from '@koobiq/components/splitter';

/**
 * @title Basic Splitter
 */
@Component({
    selector: 'splitter-vertical-example',
    templateUrl: 'splitter-vertical-example.html',
    styleUrls: ['splitter-vertical-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SplitterVerticalExample {
    direction = Direction;
}
