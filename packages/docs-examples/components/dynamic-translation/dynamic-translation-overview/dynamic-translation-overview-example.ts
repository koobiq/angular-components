import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDynamicTranslationModule } from '@koobiq/components/dynamic-translation';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Dynamic translation overview example
 */
@Component({
    selector: 'dynamic-translation-overview-example',
    imports: [KbqDynamicTranslationModule, KbqLinkModule],
    template: `
        <kbq-dynamic-translation text="Incident created. [[link:Open in a new tab]] to continue working.">
            <a
                *kbqDynamicTranslationSlot="'link'; let context"
                kbq-link
                href="https://koobiq.io/en/components/dynamic-translation"
                target="_blank"
            >
                {{ context }}
            </a>
        </kbq-dynamic-translation>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTranslationOverviewExample {}
