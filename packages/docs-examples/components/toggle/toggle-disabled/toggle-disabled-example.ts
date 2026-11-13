import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Toggle Disabled
 */
@Component({
    selector: 'toggle-disabled-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="value()" [disabled]="true" (change)="value.set($event.checked)">
            {{ t().vibration }}
        </kbq-toggle>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ToggleDisabledExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly value = signal(false);
}
