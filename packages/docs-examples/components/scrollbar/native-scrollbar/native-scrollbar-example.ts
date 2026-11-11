import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';
import { injectExampleText } from './l10n';

/**
 * @title Native scrollbar example
 */
@Component({
    selector: 'native-scrollbar-example',
    imports: [KbqNativeScrollbar],
    template: `
        <div kbqNativeScrollbar class="example-scrollbar">
            <p>
                {{ text().bruteForce1 }}
            </p>
            <p>
                {{ text().bruteForce2 }}
            </p>
            <p>
                {{ text().bruteForce3 }}
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
export class NativeScrollbarExample {
    protected readonly text = injectExampleText();
}
