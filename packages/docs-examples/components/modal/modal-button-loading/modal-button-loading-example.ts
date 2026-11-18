import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { IModalButtonOptions, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Modal buttons in the loading state
 */
@Component({
    selector: 'modal-button-loading-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openModal()">{{ t().open }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalButtonLoadingExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly modalService = inject(KbqModalService);

    private readonly saving = signal(false);

    openModal(): void {
        const buttons: IModalButtonOptions[] = [
            {
                label: this.t().save,
                type: 'primary',
                kbqModalMainAction: true,
                // While the returned promise is pending, the button renders a spinner automatically.
                onClick: () => this.save()
            },
            {
                label: this.t().cancel,
                disabled: () => this.saving(),
                onClick: () => modalRef.close()
            }
        ];

        const modalRef: KbqModalRef = this.modalService.create({
            kbqTitle: this.t().title,
            kbqSize: ModalSize.Small,
            kbqContent: this.t().content,
            kbqFooter: buttons
        });
    }

    private save(): Promise<void> {
        this.saving.set(true);

        return new Promise<void>((resolve) =>
            setTimeout(() => {
                this.saving.set(false);
                resolve();
            }, 1500)
        );
    }
}
