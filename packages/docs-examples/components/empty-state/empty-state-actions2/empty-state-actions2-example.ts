import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';

/**
 * @title Empty-state actions more
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'empty-state-actions2-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-text>{{ emptyStateText }}</div>
            <div kbq-empty-state-actions>
                <button [color]="colors.Theme" [kbqStyle]="styles.Transparent" kbq-button>Action 1</button>
                <button [color]="colors.Theme" [kbqStyle]="styles.Transparent" kbq-button>Action 2</button>
                <button [color]="colors.Theme" [kbqStyle]="styles.Transparent" kbq-button>Action 3</button>
            </div>
        </kbq-empty-state>
    `
})
export class EmptyStateActions2Example {
    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;

    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
