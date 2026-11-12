import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Tooltip
 */
@Component({
    selector: 'tooltip-overview-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    template: `
        <button kbq-button [attr.aria-label]="text().add" [kbqTooltip]="text().create">
            <i kbq-icon="kbq-plus_16"></i>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    }
})
export class TooltipOverviewExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
