import { Component } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';

/**
 * @title Empty-state text only
 */
@Component({
    standalone: true,
    selector: 'empty-state-text-only-example',
    imports: [
        KbqEmptyStateModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-text>Нет информации</div>
        </kbq-empty-state>
    `
})
export class EmptyStateTextOnlyExample {
    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;
}
