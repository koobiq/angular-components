import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { TextAreaExamplesModule } from '../../docs-examples/components/textarea';

@Component({
    standalone: true,
    imports: [TextAreaExamplesModule],
    selector: 'dev-examples',
    template: `
        <text-area-overview-example />
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
            flex-wrap: wrap;
        }

        :host > * {
            border-radius: var(--kbq-size-border-radius);
            border: 1px solid var(--kbq-line-contrast-less);
            margin-bottom: var(--kbq-size-l);
            padding: var(--kbq-size-m);
            flex: 1 0 auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [KbqTextareaModule, KbqFormFieldModule, FormsModule, DevExamples, KbqIcon],
    selector: 'dev-app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value: string;
}
