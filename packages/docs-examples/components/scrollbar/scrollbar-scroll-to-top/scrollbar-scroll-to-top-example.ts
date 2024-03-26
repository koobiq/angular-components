import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Scrollbar Scroll To Top
 */
@Component({
    selector: 'scrollbar-scroll-to-top-example',
    templateUrl: 'scrollbar-scroll-to-top-example.html',
    styleUrls: ['scrollbar-scroll-to-top-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ScrollbarScrollToTopExample {

    constructor(public cdr: ChangeDetectorRef) {}

}
