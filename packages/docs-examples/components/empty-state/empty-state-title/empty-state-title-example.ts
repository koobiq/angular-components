import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';

/**
 * @title Empty-state title
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'empty-state-title-example',
    imports: [
        KbqEmptyStateModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-title>Нет групп</div>
            <div kbq-empty-state-text>{{ emptyStateText }}</div>
        </kbq-empty-state>
    `
})
export class EmptyStateTitleExample {
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
