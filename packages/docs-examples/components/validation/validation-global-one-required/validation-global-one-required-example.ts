import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Validation global one required
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-global-one-required-example',
    templateUrl: 'validation-global-one-required-example.html',
    imports: [
        KbqAlertModule,
        KbqIconModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule,
        KbqLinkModule,
        FormsModule,
        ReactiveFormsModule
    ],
    styles: `
        :host ::ng-deep .kbq-alert {
            margin-bottom: 16px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    }
})
export class ValidationGlobalOneRequiredExample {
    protected readonly form = new FormGroup({
        series: new FormControl(''),
        number: new FormControl(''),
        lastName: new FormControl(''),
        firstName: new FormControl(''),
        patronymic: new FormControl('')
    });

    protected readonly showServerErrors = signal(false);
    protected readonly inProgress = signal(false);
    protected readonly disabled = signal(false);
    protected readonly showError = signal(false);

    checkForm() {
        this.showError.set(
            [this.form.controls.series, this.form.controls.number, this.form.controls.lastName].some(
                (control) => !control.value
            )
        );
    }
}
