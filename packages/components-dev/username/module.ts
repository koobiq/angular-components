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
