import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDynamicTranslationModule } from '@koobiq/components/dynamic-translation';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Dynamic translation overview example
 */
@Component({
    standalone: true,
    imports: [KbqDynamicTranslationModule, KbqLinkModule],
    selector: 'dynamic-translation-overview-example',
    template: `
        <kbq-dynamic-translation text="Incident created. [[link:Open in a new tab]] to continue working.">
            <a
                *kbqDynamicTranslationSlot="'link'; let text"
                kbq-link
                href="https://koobiq.io/en/dynamic-translation"
                target="_blank"
            >
                {{ text }}
            </a>
        </kbq-dynamic-translation>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTranslationOverviewExample {}
