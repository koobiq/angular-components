import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    signal,
    viewChild,
    viewChildren
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Validation on submit
 */
@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'validation-on-submit-example',
    template: `
        <div class="example-container">
            <div
                class="example-alert__container"
                #alertContainer
                [class.example-alert__container_hidden]="!showServerErrors()"
                [class.layout-margin-bottom-l]="showServerErrors()"
                tabindex="0"
            >
                <kbq-alert class="example-alert" [compact]="true" alertColor="error" alertStyle="colored">
                    <i color="error" kbq-icon="kbq-info-circle_16"></i>
                    The server didn’t respond while sending data. Please try again.
                </kbq-alert>
            </div>

            <form class="kbq-form-vertical" [formGroup]="globalErrorForm" (ngSubmit)="submitForm()" novalidate>
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
                            (keydown.enter)="submitOrigin = 'keyboard'"
                            (keydown.space)="submitOrigin = 'keyboard'"
                            (mouseleave)="submitOrigin = 'mouse'"
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
        .example-alert {
            transition: opacity 50ms ease-in-out;
        }

        .example-alert.example-alert_in-progress {
            opacity: var(--kbq-opacity-disabled);
        }

        .example-container {
            width: 320px;
        }

        form {
            width: 100%;
        }

        .example-alert__container {
            border: 2px solid transparent;
            border-radius: 14px;
        }

        .example-alert__container_hidden {
            border: 0;
            overflow: hidden;
            height: 0;
        }

        .example-alert__container.cdk-mouse-focused:focus-visible {
            border-color: transparent;
            outline: none;
        }

        .example-alert__container.cdk-keyboard-focused:focus-visible {
            border-color: var(--kbq-states-line-focus);
            outline: none;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    }
})
export class ValidationOnSubmitExample implements AfterViewInit, OnDestroy {
    protected readonly alertContainer = viewChild<ElementRef<HTMLDivElement>>('alertContainer');

    protected readonly showServerErrors = signal(false);
    protected readonly inProgress = signal(false);
    protected readonly globalErrorForm = new FormGroup({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('')
    });

    protected readonly focusMonitor = inject(FocusMonitor);
    protected submitOrigin: FocusOrigin | null = null;
    private readonly formFieldList = viewChildren(KbqFormField);

    ngAfterViewInit() {
        const alert = this.alertContainer();

        if (alert) {
            this.focusMonitor.monitor(alert.nativeElement);
        }
    }

    ngOnDestroy(): void {
        const alert = this.alertContainer();

        if (alert) {
            this.focusMonitor.stopMonitoring(alert.nativeElement);
        }
    }

    submitForm(): void {
        if (this.globalErrorForm.invalid) {
            this.focusFirstInvalidControl();

            return;
        }

        this.inProgress.set(true);

        setTimeout(() => {
            this.inProgress.set(false);
            this.showServerErrors.set(Math.random() > 0.5);

            const alert = this.alertContainer();

            if (this.showServerErrors() && alert) {
                this.focusMonitor.focusVia(alert.nativeElement, this.submitOrigin);
                this.submitOrigin = null;
            }
        }, 1000);
    }

    private focusFirstInvalidControl(): void {
        setTimeout(() => {
            const invalidControl = this.formFieldList().find((control) => control.invalid);

            invalidControl?.focus();
        });
    }
}
