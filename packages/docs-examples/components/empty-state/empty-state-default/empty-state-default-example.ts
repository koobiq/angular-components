import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Empty-state default
 */
@Component({
    selector: 'empty-state-default-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-title>Нет групп</div>
            <div kbq-empty-state-text>{{ emptyStateText }}</div>
            <div kbq-empty-state-actions>
                <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'">
                    <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                    {{ buttonText }}
                </button>
            </div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateDefaultExample {
    buttonText = 'Создать группу';
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
