import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChildren } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { take } from 'rxjs';

type DocsFormData = {
    firstName: string;
    lastName: string;
};

@Component({
    standalone: true,
    selector: 'docs-empty-form',
    imports: [KbqFormsModule, KbqFormFieldModule, FormsModule, KbqButtonModule, KbqInputModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="layout-margin">
            <form
                class="kbq-form-vertical"
                id="docs-form"
                [formGroup]="userDetailsForm"
                (ngSubmit)="onSubmit()"
                novalidate
            >
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
        </div>
    `
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-on-open-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button (click)="openEmptyForm(footer)" kbq-button color="contrast">Open empty form</button>
        <button (click)="openDraftForm(footer)" kbq-button color="contrast-fade">Open draft</button>

        <ng-template #footer>
            <button type="submit" form="docs-form" kbq-button color="contrast">Save</button>
            <button
                (click)="modalRef.close(modalRef.getContentComponent().userDetailsForm.value)"
                kbq-button
                color="contrast-fade"
            >
                Cancel
            </button>
        </ng-template>
    `,
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
