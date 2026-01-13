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
import {
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

/**
 * @title Validation message global
 */
@Component({
    selector: 'validation-message-global-example',
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
    template: `
        <div class="example-container">
            @if (inProgress()) {
                <kbq-loader-overlay [size]="'compact'" />
            }

            <div
                #alertContainer
                class="example-alert__container"
                tabindex="0"
                [class.example-alert__container_hidden]="!showServerErrors()"
                [class.layout-margin-bottom-l]="showServerErrors()"
            >
                <kbq-alert class="example-alert" alertColor="error" alertStyle="colored" [compact]="true">
                    <i color="error" kbq-icon="kbq-circle-info_16"></i>
                    The server didn’t respond while sending data. Please try again.
                </kbq-alert>
            </div>

            <form class="kbq-form-vertical" novalidate [formGroup]="globalErrorForm" (ngSubmit)="submitForm()">
                <div class="kbq-form__fieldset">
                    <div class="kbq-form__row">
                        <kbq-form-field>
                            <kbq-label>Name</kbq-label>
                            <input formControlName="firstName" kbqInput />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row layout-margin-bottom-xxl">
                        <kbq-form-field>
                            <kbq-label>Last name</kbq-label>
                            <input formControlName="lastName" kbqInput />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <button
                            #submitButton
                            class="flex-25"
                            color="contrast"
                            kbq-button
                            type="submit"
                            [class.kbq-progress]="inProgress()"
                            [disabled]="inProgress()"
                            (keydown.enter)="submitOrigin = 'keyboard'"
                            (keydown.space)="submitOrigin = 'keyboard'"
                            (mouseleave)="submitOrigin = 'mouse'"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `,
    styles: `
        .example-container {
            width: 320px;
        }

        form {
            width: 100%;
            padding: 1px;
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
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationMessageGlobalExample implements AfterViewInit, OnDestroy {
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
        }, 2000);
    }

    private focusFirstInvalidControl(): void {
        setTimeout(() => {
            const invalidControl = this.formFieldList().find((control) => control.invalid);

            invalidControl?.focus();
        });
    }
}
