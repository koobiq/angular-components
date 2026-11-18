import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

@Component({
    selector: 'example-password-form',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form">
            <kbq-form-field>
                <input kbqInput type="password" formControlName="current" [placeholder]="t().currentPassword" />
            </kbq-form-field>
            <kbq-form-field>
                <input kbqInput type="password" formControlName="next" [placeholder]="t().newPassword" />
            </kbq-form-field>
            @if (wrongPassword()) {
                <kbq-error>{{ t().wrongPassword }}</kbq-error>
            }
            <kbq-hint>{{ t().demoHint }}</kbq-hint>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplePasswordForm {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly form = new FormGroup({
        current: new FormControl('', [Validators.required]),
        next: new FormControl('', [Validators.required])
    });

    /** Whether the backend rejected the current password. */
    readonly wrongPassword = signal(false);
}

/**
 * @title Modal that stays open on a form error
 */
@Component({
    selector: 'modal-keep-open-on-error-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openModal()">{{ t().changePassword }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalKeepOpenOnErrorExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly modalService = inject(KbqModalService);

    openModal(): void {
        this.modalService.create<ExamplePasswordForm>({
            kbqTitle: this.t().title,
            kbqSize: ModalSize.Small,
            kbqContent: ExamplePasswordForm,
            kbqOkText: this.t().save,
            kbqCancelText: this.t().cancel,
            kbqOkClick: (instance) => this.save(instance)
        });
    }

    /** Simulated backend call: rejects any current password except «password». */
    private save(instance: ExamplePasswordForm): Promise<false | void> {
        return new Promise((resolve) =>
            setTimeout(() => {
                if (instance.form.controls.current.value === 'password') {
                    // The dialog closes; anything but `false` means close.
                    resolve();
                } else {
                    // Returning `false` keeps the dialog open, so the entered data survives.
                    instance.wrongPassword.set(true);
                    resolve(false);
                }
            }, 1000)
        );
    }
}
