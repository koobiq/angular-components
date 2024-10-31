import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge fill and style
 */
@Component({
    standalone: true,
    selector: 'badge-fill-and-style-example',
    templateUrl: 'badge-fill-and-style-example.html',
    styleUrl: 'badge-fill-and-style-example.css',
    imports: [
        KbqBadgeModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class BadgeFillAndStyleExample {
    colors = KbqBadgeColors;
}
