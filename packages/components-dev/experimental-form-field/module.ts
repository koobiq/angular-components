import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { FormFieldExamplesModule } from 'packages/docs-examples/components/form-field';

@Component({
    standalone: true,
    imports: [
        FormFieldExamplesModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqInputModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormFieldDev {}
