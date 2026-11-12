import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Toggle Error
 */
@Component({
    selector: 'toggle-error-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="value()" [color]="color" (change)="value.set($event.checked)">
            {{ t().vibration }}
        </kbq-toggle>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ToggleErrorExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly value = signal(false);
    protected readonly color = KbqComponentColors.Error;

    constructor() {
        super(TRANSLATIONS);
    }
}
