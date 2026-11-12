import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDynamicTranslationModule } from '@koobiq/components/dynamic-translation';
import { KbqLink } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Dynamic translation overview example
 */
@Component({
    selector: 'dynamic-translation-overview-example',
    imports: [KbqDynamicTranslationModule, KbqLink],
    template: `
        <kbq-dynamic-translation [text]="t().message">
            <a
                *kbqDynamicTranslationSlot="'link'; let context"
                kbqLink
                href="https://koobiq.io/en/components/dynamic-translation"
                target="_blank"
            >
                {{ context }}
            </a>
        </kbq-dynamic-translation>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTranslationOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
