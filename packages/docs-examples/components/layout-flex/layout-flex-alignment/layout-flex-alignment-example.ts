import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Flex layout
 */
@Component({
    selector: 'layout-flex-alignment-example',
    templateUrl: 'layout-flex-alignment-example.html',
    styleUrls: ['layout-flex-alignment-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class LayoutFlexAlignmentExample {
    layoutHorizontalAlignment: string = '-start';
    layoutVerticalAlignment: string = '-start';
}
