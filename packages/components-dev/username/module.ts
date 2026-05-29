import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { UsernameExamplesModule } from '../../docs-examples/components/username';

@Component({
    selector: 'dev-examples',
    imports: [UsernameExamplesModule],
    template: `
        <username-overview-example />
        <username-playground-example />
        <username-custom-example />
        <username-as-link-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples],
    templateUrl: './template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
