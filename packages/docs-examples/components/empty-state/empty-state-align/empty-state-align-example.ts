import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Empty-state align
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'empty-state-align-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row layout-wrap">
            <kbq-empty-state class="flex" style="min-height: 216px">
                <div kbq-empty-state-title>Нет групп</div>
                <div kbq-empty-state-text>{{ emptyStateText }}</div>
                <div kbq-empty-state-actions>
                    <button [color]="colors.Theme" [kbqStyle]="styles.Transparent" kbq-button>
                        <i [color]="'theme'" kbq-icon="kbq-plus_16"></i>
                        {{ buttonText }}
                    </button>
                </div>
            </kbq-empty-state>

            <kbq-empty-state class="flex" [alignTop]="true" style="min-height: 216px">
                <div kbq-empty-state-title>Нет групп</div>
                <div kbq-empty-state-text>{{ emptyStateText }}</div>
                <div kbq-empty-state-actions>
                    <button [color]="colors.Theme" [kbqStyle]="styles.Transparent" kbq-button>
                        <i [color]="'theme'" kbq-icon="kbq-plus_16"></i>
                        {{ buttonText }}
                    </button>
                </div>
            </kbq-empty-state>
        </div>
    `
})
export class EmptyStateAlignExample {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;

    buttonText = 'Создать группу';
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
