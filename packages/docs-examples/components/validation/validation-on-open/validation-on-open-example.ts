import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChildren } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { take } from 'rxjs';

type DocsFormData = {
    firstName: string;
    lastName: string;
};

@Component({
    selector: 'docs-empty-form',
    imports: [KbqFormsModule, KbqFormFieldModule, FormsModule, KbqButtonModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <form class="kbq-form-vertical" id="docs-form" novalidate [formGroup]="userDetailsForm" (ngSubmit)="onSubmit()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <div class="kbq-form__label">Name</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="firstName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <div class="kbq-form__label">Surname</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="lastName" kbqInput />
                    </kbq-form-field>
                </div>
            </div>
        </form>
    `,
    styles: `
        form {
            padding: 1px;
        }
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNameFormComponent {
    protected readonly modalData = inject<DocsFormData>(KBQ_MODAL_DATA, { optional: true });
    protected readonly modalRef = inject(KbqModalRef);
    protected readonly formFieldList = viewChildren(KbqFormField);
    readonly userDetailsForm = new FormGroup({
        firstName: new FormControl(this.modalData?.firstName || '', Validators.required),
        lastName: new FormControl(this.modalData?.lastName || '', Validators.required)
    });

    onSubmit(): void {
        this.focusFirstInvalidControl();

        if (this.userDetailsForm.invalid) return;

        this.modalRef.close(this.userDetailsForm.value);
    }

    private focusFirstInvalidControl(): void {
        setTimeout(() => {
            const invalidControl = this.formFieldList().find((control) => control.invalid);

            invalidControl?.focus();
        });
    }
}

/**
 * @title Validation on open
 */
@Component({
    selector: 'validation-on-open-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button color="contrast" (click)="openEmptyForm(footer)">Open empty form</button>
        <button kbq-button color="contrast-fade" (click)="openDraftForm(footer)">Open draft</button>

        <ng-template #footer>
            <button type="submit" form="docs-form" kbq-button color="contrast">Save</button>
            <button
                kbq-button
                color="contrast-fade"
                (click)="modalRef.close(modalRef.getContentComponent().userDetailsForm.value)"
            >
                Cancel
            </button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row layout-gap-l'
    }
})
export class ValidationOnOpenExample {
    protected readonly modalService = inject(KbqModalService);
    protected modalRef: KbqModalRef<DocsNameFormComponent>;

    openEmptyForm(footer: TemplateRef<any>): void {
        this.modalRef = this.modalService.create({
            kbqSize: ModalSize.Small,
            kbqContent: DocsNameFormComponent,
            kbqFooter: footer
        });

        this.modalRef.afterOpen.pipe(take(1)).subscribe(() => {
            this.modalRef.getElement().getElementsByTagName('input').item(0)?.focus();
        });
    }

    openDraftForm(footer: TemplateRef<any>): void {
        this.modalRef = this.modalService.create({
            kbqSize: ModalSize.Small,
            kbqContent: DocsNameFormComponent,
            kbqFooter: footer,
            data: {
                firstName: 'Romano',
                lastName: ''
            } satisfies DocsFormData
        });

        this.modalRef.afterOpen.pipe(take(1)).subscribe(() => {
            this.modalRef.getElement().getElementsByTagName('button').item(0)?.click();
        });
    }
}
