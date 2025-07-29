import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqDisableLegacyValidationDirectiveProvider, KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Validation message global with links
 */
@Component({
    selector: 'validation-message-global-with-links-example',
    standalone: true,
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
    templateUrl: 'validation-message-global-with-links-example.html',
    styles: `
        form {
            width: 320px;
            padding: 1px;
        }

        .example-alert {
            transition: opacity 50ms ease-in-out;
        }

        .example-alert.example-alert_in-progress {
            opacity: var(--kbq-opacity-disabled);
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    },
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
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
