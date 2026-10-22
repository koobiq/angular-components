import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqLink } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Badge table
 */
@Component({
    selector: 'badge-table-example',
    imports: [
        KbqBadgeModule,
        KbqLink,
        KbqTableModule
    ],
    templateUrl: 'badge-table-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeTableExample {
    colors = KbqBadgeColors;
}
