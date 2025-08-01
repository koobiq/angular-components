import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { UsernameExamplesModule } from '../../docs-examples/components/username';

@Component({
    selector: 'dev-examples',
    standalone: true,
    imports: [UsernameExamplesModule],
    template: `
        <username-overview-example />
        <username-playground-example />
        <username-custom-example />
        <username-as-link-example />
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
class DevExamples {}

@Component({
    selector: 'dev-app',
    standalone: true,
    imports: [DevExamples],
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
