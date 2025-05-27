import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge fill and style
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'badge-fill-and-style-example',
    templateUrl: 'badge-fill-and-style-example.html',
    styleUrls: ['badge-fill-and-style-example.css'],
    imports: [
        KbqBadgeModule
    ]
})
export class BadgeFillAndStyleExample {
    colors = KbqBadgeColors;
}
