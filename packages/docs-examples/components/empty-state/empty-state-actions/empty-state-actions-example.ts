import { Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';

/**
 * @title Empty-state actions
 */
@Component({
    standalone: true,
    selector: 'empty-state-actions-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-text>{{ emptyStateText }}</div>
            <div class="layout-row layout-align-center" kbq-empty-state-actions style="min-width: 340px">
                <button class="layout-margin-right-s" [color]="colors.Contrast" [kbqStyle]="styles.Filled" kbq-button>
                    {{ buttonText }}
                </button>

                <button [color]="colors.ContrastFade" [kbqStyle]="styles.Filled" kbq-button>Объединить группы</button>
            </div>
        </kbq-empty-state>
    `
})
export class EmptyStateActionsExample {
    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;

    buttonText = 'Создать группу';
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
