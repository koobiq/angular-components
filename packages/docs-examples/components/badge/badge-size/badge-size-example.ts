import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge size
 */
@Component({
    selector: 'badge-size-example',
    imports: [
        KbqBadgeModule
    ],
    template: `
        <div class="layout-row layout-gap-l">
            <kbq-badge [badgeColor]="colors.Success">Normal</kbq-badge>
            <kbq-badge [badgeColor]="colors.Success" [compact]="true">Compact</kbq-badge>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeSizeExample {
    colors = KbqBadgeColors;
}
