import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge fill and style
 */
@Component({
    selector: 'badge-fill-and-style-example',
    imports: [
        KbqBadgeModule
    ],
    templateUrl: 'badge-fill-and-style-example.html',
    styleUrls: ['badge-fill-and-style-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeFillAndStyleExample {
    colors = KbqBadgeColors;
}
