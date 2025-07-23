import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqAlert, KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Validation on submit
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-on-submit-example',
    template: `
        <div class="example-container">
            @if (showServerErrors()) {
                <kbq-alert [alertColor]="'error'" [alertStyle]="'colored'" [compact]="true">
                    <i color="error" kbq-icon="kbq-info-circle_16"></i>
                    При попытке отправить данные сервер не ответил, попробуйте снова
                </kbq-alert>
            }

            <form
                class="kbq-form-vertical"
                [formGroup]="globalErrorForm"
                (ngSubmit)="submitGlobalErrorForm()"
                novalidate
            >
                <div class="kbq-form__fieldset">
                    <div class="kbq-form__row">
                        <kbq-form-field>
                            <kbq-label>Name</kbq-label>
                            <input formControlName="firstName" kbqInput />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <kbq-form-field>
                            <kbq-label>Last name</kbq-label>
                            <input formControlName="lastName" kbqInput />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <button
                            class="flex-25"
                            #submitButton
                            [class.kbq-progress]="inProgress()"
                            [disabled]="inProgress()"
                            color="contrast"
                            kbq-button
                            type="submit"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `,
    imports: [
        KbqAlertModule,
        KbqIconModule,
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule
    ],
    styles: `
        .example-container {
            width: 320px;
        }

        :host ::ng-deep .kbq-alert {
            margin-bottom: 16px;
        }

        form {
            width: 100%;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    }
})
export class ValidationOnSubmitExample {
    protected readonly submitButton = viewChild<ElementRef>('submitButton');
    protected readonly alert = viewChild(KbqAlert, { read: ElementRef });

    protected readonly showServerErrors = signal(false);
    protected readonly inProgress = signal(false);
    protected readonly globalErrorForm = new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        thirdName: new FormControl('')
    });

    submitGlobalErrorForm() {
        this.showServerErrors.set(false);
        this.inProgress.set(true);

        setTimeout(() => {
            this.showServerErrors.set(true);
            this.inProgress.set(false);
        }, 1000);
    }
}
