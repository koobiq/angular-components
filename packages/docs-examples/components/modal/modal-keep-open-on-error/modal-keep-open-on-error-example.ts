import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, type Observable } from 'rxjs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_WINDOW, type KbqCloseReason } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { type KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

@Component({
    selector: 'example-password-form',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <label class="kbq-form__label" for="keep-open-current">{{ t().currentPassword }}</label>
                    <kbq-form-field class="kbq-form__control">
                        <input id="keep-open-current" kbqInput type="password" formControlName="current" />
                    </kbq-form-field>
                </div>
                <div class="kbq-form__row">
                    <label class="kbq-form__label" for="keep-open-next">{{ t().newPassword }}</label>
                    <kbq-form-field class="kbq-form__control">
                        <input id="keep-open-next" kbqInput type="password" formControlName="next" />
                    </kbq-form-field>
                </div>
            </div>
            @if (wrongPassword()) {
                <kbq-error>{{ t().wrongPassword }}</kbq-error>
            }
            <kbq-hint>{{ t().demoHint }}</kbq-hint>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplePasswordForm {
    private readonly window = inject(KBQ_WINDOW);

    protected readonly t = injectTranslation(TRANSLATIONS);
    readonly form = new FormGroup({
        current: new FormControl('', [Validators.required]),
        next: new FormControl('', [Validators.required])
    });

    /** Whether the backend rejected the current password. */
    readonly wrongPassword = signal(false);

    /** Mirrors `form.dirty`: the form group is not reactive, the guard and the unload warning read this. */
    readonly dirty = signal(false);

    constructor() {
        // Leaving the tab cannot show a Koobiq dialog: the browser shows its own confirmation
        // while the form is dirty. The text is up to the browser and cannot be changed.
        effect((onCleanup) => {
            if (!this.dirty()) return;

            const warnOnUnload = (event: BeforeUnloadEvent) => event.preventDefault();

            this.window.addEventListener('beforeunload', warnOnUnload);
            onCleanup(() => this.window.removeEventListener('beforeunload', warnOnUnload));
        });

        this.form.valueChanges.subscribe(() => this.dirty.set(this.form.dirty));
    }

    /** Resets the form state: after a successful save or on an explicit discard the dialog closes without a confirmation. */
    markClean(): void {
        this.form.markAsPristine();
        this.dirty.set(false);
    }
}

/**
 * @title Modal that stays open on a form error
 */
@Component({
    selector: 'modal-keep-open-on-error-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button type="button" (click)="openModal()">{{ t().changePassword }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalKeepOpenOnErrorExample {
    private readonly modalService = inject(KbqModalService);

    private modalRef?: KbqModalRef<ExamplePasswordForm>;

    protected readonly t = injectTranslation(TRANSLATIONS);

    openModal(): void {
        this.modalRef = this.modalService.create<ExamplePasswordForm>({
            kbqTitle: this.t().title,
            kbqSize: ModalSize.Small,
            kbqContent: ExamplePasswordForm,
            kbqOkText: this.t().save,
            kbqCancelText: this.t().cancel,
            kbqOkClick: (instance) => this.save(instance),
            // Cancel and the header close button are an explicit discard: they close without the
            // confirmation, like Save.
            kbqCancelClick: (instance) => instance.markClean(),
            canClose: (reason) => this.canClose(reason)
        });
    }

    private canClose(reason: KbqCloseReason): boolean | Observable<boolean> {
        const instance = this.modalRef?.getContentComponent();

        if (reason === 'programmatic' || !instance?.dirty()) return true;

        return this.modalService
            .confirm({
                kbqTitle: this.t().confirmTitle,
                kbqContent: this.t().confirmContent,
                kbqOkText: this.t().discard,
                kbqCancelText: this.t().keepEditing,
                kbqOkClick: () => 'ok'
            })
            .afterClose.pipe(map((result) => result === 'ok'));
    }

    /** Simulated backend call: rejects any current password except «password». */
    private save(instance: ExamplePasswordForm): Promise<false | void> {
        return new Promise((resolve) =>
            setTimeout(() => {
                if (instance.form.controls.current.value === 'password') {
                    // The dialog closes; anything but `false` means close.
                    instance.markClean();
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
