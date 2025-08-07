import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqClampedText } from '@koobiq/components/clamped-text';

/**
 * @title Clamped-text overview
 */
@Component({
    selector: 'clamped-text-overview-example',
    standalone: true,
    imports: [KbqClampedText],
    template: `
        <div>
            <kbq-clamped-text>{{ text }}</kbq-clamped-text>
        </div>
    `,
    styles: `
        div {
            overflow: auto;
            resize: horizontal;
            max-width: 500px;
            min-width: 150px;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedTextOverviewExample {
    text = Array.from({ length: 100 }, (_, i) => `Text ${i}`).join(' ');
}
