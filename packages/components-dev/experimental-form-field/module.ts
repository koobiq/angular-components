import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormFieldExamplesModule } from 'packages/docs-examples/components/form-field';

@Component({
    standalone: true,
    imports: [
        FormFieldExamplesModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormFieldDev {}
