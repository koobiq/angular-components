import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectExampleText } from '../l10n';

/**
 * @title Modal with caption
 */
@Component({
    selector: 'modal-caption-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openWithStringCaption()">{{ text().stringCaption }}</button>
        <button kbq-button (click)="openWithTemplateCaption(captionTpl)">{{ text().templateCaption }}</button>

        <ng-template #captionTpl>
            <span>
                Custom
                <strong>{{ text().templateWord }}</strong>
                caption caption caption caption caption caption caption caption caption caption
            </span>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-gap-m'
    }
})
export class ModalCaptionExample {
    protected readonly text = injectExampleText();

    private readonly modalService = inject(KbqModalService);

    openWithStringCaption(): void {
        this.modalService.create({
            kbqTitle: this.text().dialogTitle,
            kbqCaption: 'Additional context or description for the dialog',
            kbqContent: 'Modal body content',
            kbqOkText: 'Ok',
            kbqCancelText: this.text().cancel
        });
    }

    openWithTemplateCaption(kbqCaption: TemplateRef<object>): void {
        this.modalService.create({
            kbqTitle: this.text().longDialogTitle,
            kbqCaption,
            kbqContent: 'Modal body content',
            kbqOkText: 'Ok',
            kbqCancelText: this.text().cancel,
            kbqSize: ModalSize.Small
        });
    }
}
