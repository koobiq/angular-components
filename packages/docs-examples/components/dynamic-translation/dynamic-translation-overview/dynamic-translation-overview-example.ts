import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDynamicTranslationModule } from '@koobiq/components/dynamic-translation';
import { KbqLink } from '@koobiq/components/link';
import { injectExampleText } from '../l10n';

/**
 * @title Dynamic translation overview example
 */
@Component({
    selector: 'dynamic-translation-overview-example',
    imports: [KbqDynamicTranslationModule, KbqLink],
    template: `
        <kbq-dynamic-translation [text]="text().message">
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
export class DynamicTranslationOverviewExample {
    protected readonly text = injectExampleText();
}
