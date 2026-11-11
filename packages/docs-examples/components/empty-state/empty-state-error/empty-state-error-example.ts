import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Empty-state error
 */
@Component({
    selector: 'empty-state-error-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px" [errorColor]="true">
            <i
                kbq-empty-state-icon
                kbq-icon-item="kbq-triangle-exclamation_16"
                [big]="true"
                [color]="'contrast'"
                [fade]="true"
            ></i>
            <h2 kbq-empty-state-title>{{ text().errorTitle }}</h2>
            <div kbq-empty-state-text>
                {{ text().errorText }}
            </div>
            <div kbq-empty-state-actions>
                <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'">{{ text().refresh }}</button>
            </div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateErrorExample {
    protected readonly text = injectExampleText();
}
