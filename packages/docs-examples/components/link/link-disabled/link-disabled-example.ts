import { Component, ViewEncapsulation } from '@angular/core';


/**
 * @title Pseudo link
 */
@Component({
    selector: 'link-disabled-example',
    templateUrl: 'link-disabled-example.html',
    styleUrls: ['link-disabled-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class LinkDisabledExample {
    disabled = true;
}
