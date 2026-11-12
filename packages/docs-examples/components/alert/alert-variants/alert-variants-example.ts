import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlert, KbqAlertColors, KbqAlertStyles, KbqAlertTitle } from '@koobiq/components/alert';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Alert variants
 */
@Component({
    selector: 'alert-variants-example',
    imports: [
        KbqAlert,
        KbqAlertTitle,
        KbqIcon,
        KbqIconItem
    ],
    template: `
        <div class="layout-row example-row layout-gap-l flex-100">
            <div class="layout-column example-column">
                <kbq-alert [alertColor]="alertColors.Error">
                    <i aria-hidden="true" kbq-icon-item="kbq-triangle-exclamation_16" [color]="colors.Error"></i>
                    <div kbq-alert-title>Default</div>
                    {{ text().body }}
                </kbq-alert>
            </div>
            <div class="layout-column example-column">
                <kbq-alert [alertColor]="alertColors.Error" [alertStyle]="alertStyles.Colored" [compact]="true">
                    <i aria-hidden="true" kbq-icon="kbq-triangle-exclamation_16" [color]="colors.Error"></i>
                    <div kbq-alert-title>Colored</div>
                    {{ text().body }}
                </kbq-alert>
            </div>
        </div>
    `,
    styleUrls: ['alert-variants-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertVariantsExample extends BaseLocalizedExample<ExampleText> {
    colors = KbqComponentColors;
    alertStyles = KbqAlertStyles;
    alertColors = KbqAlertColors;

    constructor() {
        super(TEXT);
    }
}
