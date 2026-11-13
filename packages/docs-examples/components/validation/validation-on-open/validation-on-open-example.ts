import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChildren } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KBQ_MODAL_DATA, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { take } from 'rxjs';
import { TRANSLATIONS } from './l10n';

type DocsFormData = {
    firstName: string;
    lastName: string;
};

@Component({
    selector: 'docs-empty-form',
    imports: [KbqFormsModule, FormsModule, KbqButtonModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <form class="kbq-form-vertical" id="docs-form" novalidate [formGroup]="userDetailsForm" (ngSubmit)="onSubmit()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <div class="kbq-form__label">{{ t().name }}</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="firstName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <div class="kbq-form__label">{{ t().surname }}</div>
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
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNameFormComponent {
    protected readonly t = injectTranslation(TRANSLATIONS);

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
        KbqInputModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button color="contrast" (click)="openEmptyForm(footer)">{{ t().openEmptyForm }}</button>
        <button kbq-button color="contrast-fade" (click)="openDraftForm(footer)">{{ t().openDraft }}</button>

        <ng-template #footer>
            <button type="submit" form="docs-form" kbq-button color="contrast">{{ t().save }}</button>
            <button
                kbq-button
                color="contrast-fade"
                (click)="modalRef.close(modalRef.getContentComponent().userDetailsForm.value)"
            >
                {{ t().cancel }}
            </button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row layout-gap-l'
    }
})
export class ValidationOnOpenExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

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
