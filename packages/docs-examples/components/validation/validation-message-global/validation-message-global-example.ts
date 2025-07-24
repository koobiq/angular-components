import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqAlert, KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

/**
 * @title Validation message global
 */
@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'validation-message-global-example',
    template: `
        <div class="example-container">
            @if (inProgress()) {
                <kbq-loader-overlay [size]="'compact'" />
            }

            <kbq-alert
                class="example-alert layout-margin-bottom-l"
                [compact]="true"
                [style.display]="showServerErrors() ? null : 'none'"
                tabindex="0"
                alertColor="error"
                alertStyle="colored"
            >
                <i color="error" kbq-icon="kbq-info-circle_16"></i>
                The server didn’t respond while sending data. Please try again.
            </kbq-alert>

            <form class="kbq-form-vertical" [formGroup]="globalErrorForm" (ngSubmit)="submitForm()" novalidate>
                <div class="kbq-form__fieldset">
                    <div class="kbq-form__row">
                        <kbq-form-field>
                            <kbq-label>Name</kbq-label>
                            <input #requiredInput="kbqInput" formControlName="firstName" kbqInput />
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
        KbqFormsModule,
        KbqLoaderOverlayModule
    ],
    styles: `
        .example-alert {
            transition: opacity 50ms ease-in-out;
        }

        .example-container {
            width: 320px;
        }

        form {
            width: 100%;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    }
})
export class ValidationMessageGlobalExample {
    protected readonly requiredInput = viewChild<KbqInput>('requiredInput');
    protected readonly alert = viewChild<KbqAlert, ElementRef<HTMLElement>>(KbqAlert, { read: ElementRef });

    protected readonly showServerErrors = signal(false);
    protected readonly inProgress = signal(false);
    protected readonly globalErrorForm = new FormGroup({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('')
    });

    submitForm(): void {
        if (this.globalErrorForm.invalid) {
            this.requiredInput()?.focus();

            return;
        }

        this.inProgress.set(true);

        setTimeout(() => {
            this.inProgress.set(false);
            this.showServerErrors.set(Math.random() > 0.5);

            if (this.showServerErrors()) {
                this.alert()?.nativeElement?.focus({ preventScroll: false });
            }
        }, 2000);
    }
}
