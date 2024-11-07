import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge size
 */
@Component({
    standalone: true,
    selector: 'badge-size-example',
    styleUrls: ['badge-size-example.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqBadgeModule
    ],
    template: `
        <div class="badge-size-example">
            <kbq-badge [badgeColor]="colors.Success">Normal</kbq-badge>
            <kbq-badge
                [badgeColor]="colors.Success"
                [compact]="true"
            >
                Compact
            </kbq-badge>
        </div>
    `
})
export class BadgeSizeExample {
    colors = KbqBadgeColors;
}
