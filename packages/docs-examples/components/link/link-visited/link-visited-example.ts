import { Component, ViewEncapsulation } from '@angular/core';

/**
 * @title Pseudo link
 */
@Component({
    selector: 'link-visited-example',
    templateUrl: 'link-visited-example.html',
    styleUrls: ['link-visited-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class LinkVisitedExample {
    visited = false;
}
