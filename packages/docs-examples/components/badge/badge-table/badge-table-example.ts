import { Component } from '@angular/core';
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
    imports: [
        KbqBadgeModule,
        KbqLinkModule,
        KbqTableModule
    ]
})
export class BadgeTableExample {
    colors = KbqBadgeColors;
}
