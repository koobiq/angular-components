import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { InlineEditExamplesModule } from '../../docs-examples/components/inline-edit';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [InlineEditExamplesModule],
    selector: 'dev-examples',
    template: `
        <inline-edit-overview-example />
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
    selector: 'dev-app',
    standalone: true,
    imports: [
        DevExamples,
        DevThemeToggle
    ],
    providers: [],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
