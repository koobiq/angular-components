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
 * @title Validation message global with links
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-message-global-with-links-example',
    templateUrl: 'validation-message-global-with-links-example.html',
    imports: [
        ReactiveFormsModule,
        KbqAlertModule,
        KbqIconModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule,
        KbqLinkModule,
        FormsModule
    ],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    },
    styles: `
        .example-container {
            width: 320px;
        }

        form {
            width: 100%;
        }
    `
})
export class ValidationMessageGlobalWithLinksExample {
    protected readonly inProgress = signal(false);
    protected readonly showError = signal(false);
    protected readonly form = new FormGroup({
        series: new FormControl(''),
        number: new FormControl(''),
        lastName: new FormControl(''),
        firstName: new FormControl(''),
        patronymic: new FormControl('')
    });

    submitForm() {
        this.inProgress.set(true);

        setTimeout(() => {
            this.checkForm();
            this.inProgress.set(false);
        }, 1000);
    }

    checkForm() {
        this.showError.set(
            [this.form.controls.series, this.form.controls.number, this.form.controls.lastName].every(
                (control) => !control.value
            )
        );
    }
}
