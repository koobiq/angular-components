import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Empty-state big
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'empty-state-big-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-empty-state size="big" style="min-height: 216px">
            <div kbq-empty-state-title>Нет групп</div>
            <div kbq-empty-state-text>{{ emptyStateText }}</div>
            <div kbq-empty-state-actions>
                <button [color]="'theme'" [kbqStyle]="'transparent'" kbq-button>
                    <i [color]="'theme'" kbq-icon="kbq-plus_16"></i>
                    {{ buttonText }}
                </button>
            </div>
        </kbq-empty-state>
    `
})
export class EmptyStateBigExample {
    buttonText = 'Создать группу';
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
