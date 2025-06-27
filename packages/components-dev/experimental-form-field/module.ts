import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ExperimentalFormFieldExamplesModule } from 'packages/docs-examples/components/experimental-form-field';

@Component({
    standalone: true,
    imports: [ExperimentalFormFieldExamplesModule],
    selector: 'dev-examples',
    template: `
        <experimental-form-field-password-overview-example />
        <hr />
        <experimental-form-field-with-cleaner-example />
        <hr />
        <experimental-form-field-with-custom-error-state-matcher-set-by-attribute-example />
        <hr />
        <experimental-form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider-example />
        <hr />
        <experimental-form-field-with-error-example />
        <hr />
        <experimental-form-field-with-hint-example />
        <hr />
        <experimental-form-field-with-label-example />
        <hr />
        <experimental-form-field-without-borders-example />
        <hr />
        <experimental-form-field-with-prefix-and-suffix-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        DevExamples
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
