import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge fill and style
 */
@Component({
    selector: 'badge-overview-example',
    imports: [
        KbqBadgeModule
    ],
    templateUrl: 'badge-overview-example.html',
    styleUrls: ['badge-overview-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeOverviewExample {
    colors = KbqBadgeColors;
}
