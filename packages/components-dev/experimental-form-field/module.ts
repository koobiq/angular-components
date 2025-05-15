import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormFieldExamplesModule } from 'packages/docs-examples/components/form-field';

@Component({
    standalone: true,
    imports: [FormFieldExamplesModule],
    selector: 'dev-examples',
    template: `
        <form-field-password-overview-example />
        <hr />
        <form-field-with-cleaner-example />
        <hr />
        <form-field-with-custom-error-state-matcher-set-by-attribute-example />
        <hr />
        <form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider-example />
        <hr />
        <form-field-with-error-example />
        <hr />
        <form-field-with-hint-example />
        <hr />
        <form-field-with-label-example />
        <hr />
        <form-field-without-borders-example />
        <hr />
        <form-field-with-prefix-and-suffix-example />
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
