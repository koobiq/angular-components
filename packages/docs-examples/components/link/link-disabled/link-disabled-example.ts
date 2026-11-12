import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLink } from '@koobiq/components/link';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Link disabled
 */
@Component({
    selector: 'link-disabled-example',
    imports: [KbqLink, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="disabled">{{ t().disabled }}</kbq-toggle>

        <div class="example-stage">
            <a kbqLink href="https://koobiq.io/en/components/link" target="_blank" [disabled]="disabled()">
                {{ t().scanReport }}
            </a>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .example-stage {
            display: flex;
            align-items: center;
            min-height: 160px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkDisabledExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly disabled = model(true);

    constructor() {
        super(TRANSLATIONS);
    }
}
