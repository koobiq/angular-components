import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Badge table
 */
@Component({
    standalone: true,
    selector: 'badge-table-example',
    templateUrl: 'badge-table-example.html',
    styleUrl: 'badge-table-example.css',
    imports: [
        KbqBadgeModule,
        KbqLinkModule,
        KbqTableModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class BadgeTableExample {
    colors = KbqBadgeColors;
}
