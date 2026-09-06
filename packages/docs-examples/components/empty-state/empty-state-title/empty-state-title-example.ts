import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';

/**
 * @title Empty-state title
 */
@Component({
    selector: 'empty-state-title-example',
    imports: [
        KbqEmptyStateModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <h2 kbq-empty-state-title>Нет групп</h2>
            <div kbq-empty-state-text>{{ emptyStateText }}</div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateTitleExample {
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
