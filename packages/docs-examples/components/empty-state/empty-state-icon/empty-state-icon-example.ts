import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Empty-state icon
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'empty-state-icon-example',
    imports: [
        KbqEmptyStateModule,
        KbqIconModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-icon>
                <i [big]="true" [color]="'contrast'" [fade]="true" kbq-icon-item="kbq-info-circle_16"></i>
            </div>
            <div kbq-empty-state-text>
                This should detail the actions you can take on this screen, as well as why it’s valuable.
            </div>
        </kbq-empty-state>
    `
})
export class EmptyStateIconExample {}
