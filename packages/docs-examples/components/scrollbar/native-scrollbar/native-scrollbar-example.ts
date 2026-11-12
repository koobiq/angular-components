import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Native scrollbar example
 */
@Component({
    selector: 'native-scrollbar-example',
    imports: [KbqNativeScrollbar],
    template: `
        <div kbqNativeScrollbar class="example-scrollbar">
            <p>
                {{ t().bruteForce1 }}
            </p>
            <p>
                {{ t().bruteForce2 }}
            </p>
            <p>
                {{ t().bruteForce3 }}
            </p>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--kbq-size-l);
        }

        .example-scrollbar {
            overflow: auto;
            height: 200px;
            width: 100%;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 150%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NativeScrollbarExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
