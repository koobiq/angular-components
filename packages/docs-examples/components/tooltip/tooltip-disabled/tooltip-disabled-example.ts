import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Tooltip disabled
 */
@Component({
    selector: 'tooltip-disabled-example',
    imports: [KbqToolTipModule, KbqButtonModule, KbqIconModule],
    template: `
        <div [kbqTooltip]="t().itemLocked" [forDisabledComponent]="button">
            <button #button kbq-button [disabled]="true">
                <i kbq-icon="kbq-trash_16"></i>
                Delete
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    }
})
export class TooltipDisabledExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
