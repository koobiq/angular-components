import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title Basic tags
 */
@Component({
    selector: 'tags-overview-example',
    templateUrl: 'tags-overview-example.html',
    styleUrls: ['tags-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TagsOverviewExample {
    colors = KbqComponentColors;
    disabled = false;
}
