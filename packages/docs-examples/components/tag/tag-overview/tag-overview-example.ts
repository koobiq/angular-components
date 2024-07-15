import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Basic tag
 */
@Component({
    selector: 'tag-overview-example',
    templateUrl: 'tag-overview-example.html',
    styleUrls: ['tag-overview-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class TagOverviewExample {
    colors = KbqComponentColors;
    disabled = false;
}
