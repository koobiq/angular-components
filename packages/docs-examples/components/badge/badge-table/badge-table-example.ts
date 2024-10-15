import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';

/**
 * @title Badge table
 */
@Component({
    selector: 'badge-table-example',
    templateUrl: 'badge-table-example.html',
    styleUrls: ['badge-table-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgeTableExample {
    colors = KbqBadgeColors;
}
