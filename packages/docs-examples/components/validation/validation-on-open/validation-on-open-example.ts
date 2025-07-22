import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';

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
            <form class="kbq-form-vertical" id="docs-form" [formGroup]="userDetailsForm" novalidate>
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
    readonly userDetailsForm: FormGroup;
    protected readonly modalData = inject(KBQ_MODAL_DATA, { optional: true }) as DocsFormData | null;

    constructor() {
        this.userDetailsForm = new FormGroup({
            firstName: new FormControl(this.modalData?.firstName || '', Validators.required),
            lastName: new FormControl(this.modalData?.lastName || '', Validators.required)
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
            <button (click)="onSave()" type="submit" form="docs-form" kbq-button color="contrast">Save</button>
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

    openEmptyForm(footer: TemplateRef<any>) {
        this.modalRef = this.modalService.create({
            kbqSize: ModalSize.Small,
            kbqContent: DocsNameFormComponent,
            kbqFooter: footer
        });
    }

    openDraftForm(footer: TemplateRef<any>) {
        this.modalRef = this.modalService.create({
            kbqSize: ModalSize.Small,
            kbqContent: DocsNameFormComponent,
            kbqFooter: footer,
            data: {
                firstName: 'Roman',
                lastName: ''
            } satisfies DocsFormData
        });

        this.modalRef.afterOpen.subscribe(() => {
            this.modalRef.getContentComponent().userDetailsForm.markAsDirty();
        });
    }

    onSave() {
        const form = this.modalRef.getContentComponent().userDetailsForm;

        setTimeout(() => {
            if (form.invalid) return;

            this.modalRef.close(form.value);
        });
    }
}
