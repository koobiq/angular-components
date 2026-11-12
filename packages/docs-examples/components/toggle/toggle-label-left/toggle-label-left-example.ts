import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Toggle Label Left
 */
@Component({
    selector: 'toggle-label-left-example',
    imports: [KbqToggleModule],
    template: `
        <div class="example-toggle-label-left__container layout-align-center-start layout-column layout-gap-s">
            <kbq-toggle labelPosition="left" [checked]="true">{{ t().tapToWake }}</kbq-toggle>
            <kbq-toggle labelPosition="left">{{ t().shakeToUndo }}</kbq-toggle>
            <kbq-toggle labelPosition="left">{{ t().vibration }}</kbq-toggle>
        </div>
    `,
    styles: `
        .example-toggle-label-left__container {
            margin-bottom: 28px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-gap-s layout-margin-top-xxl'
    }
})
export class ToggleLabelLeftExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
