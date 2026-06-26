import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Modal with caption
 */
@Component({
    selector: 'modal-caption-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openWithStringCaption()">String caption</button>
        <button kbq-button (click)="openWithTemplateCaption(captionTpl)">Template caption</button>

        <ng-template #captionTpl>
            <span>
                Custom
                <strong>template</strong>
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
    private readonly modalService = inject(KbqModalService);

    openWithStringCaption(): void {
        this.modalService.create({
            kbqTitle: 'Dialog title',
            kbqCaption: 'Additional context or description for the dialog',
            kbqContent: 'Modal body content',
            kbqOkText: 'Ok',
            kbqCancelText: 'Cancel'
        });
    }

    openWithTemplateCaption(kbqCaption: TemplateRef<object>): void {
        this.modalService.create({
            kbqTitle: 'Dialog title Dialog title Dialog title Dialog title g title Dialog titl g title Dialog titl',
            kbqCaption,
            kbqContent: 'Modal body content',
            kbqOkText: 'Ok',
            kbqCancelText: 'Cancel',
            kbqSize: ModalSize.Small
        });
    }
}
