import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Badge table
 */
@Component({
    selector: 'badge-table-example',
    imports: [
        KbqBadgeModule,
        KbqLinkModule,
        KbqTableModule
    ],
    templateUrl: 'badge-table-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeTableExample {
    colors = KbqBadgeColors;
}
