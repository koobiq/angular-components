import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

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
        KbqFormsModule
    ],
    styles: `
        .docs-width {
            width: 400px;
        }

        :host ::ng-deep .kbq-alert {
            margin-bottom: 16px;
        }
    `
})
export class ValidationGlobalOneRequiredExample {
    globalErrorForm: FormGroup;
    showServerErrors = false;

    inProgress = false;
    disabled = false;
    showError = false;

    constructor() {
        this.globalErrorForm = new FormGroup({
            firstName: new FormControl(''),
            lastName: new FormControl(''),
            thirdName: new FormControl('')
        });
    }

    submitGlobalErrorForm() {
        this.showServerErrors = false;
        this.inProgress = true;

        setTimeout(() => {
            this.showServerErrors = true;
            this.inProgress = false;
        }, 1000);
    }

    checkForm() {
        this.inProgress = true;

        setTimeout(() => {
            this.inProgress = false;
            this.showError = true;
            this.disabled = true;
        }, 2000);
    }
}
