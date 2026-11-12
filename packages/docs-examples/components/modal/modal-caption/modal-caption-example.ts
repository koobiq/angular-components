import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Modal with caption
 */
@Component({
    selector: 'modal-caption-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openWithStringCaption()">{{ t().stringCaption }}</button>
        <button kbq-button (click)="openWithTemplateCaption(captionTpl)">{{ t().templateCaption }}</button>

        <ng-template #captionTpl>
            <span>
                Custom
                <strong>{{ t().templateWord }}</strong>
                caption caption caption caption caption caption caption caption caption caption
            </span>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-gap-m'
    }
})
export class ModalCaptionExample extends BaseLocalizedExample<ExampleTranslation> {
    private readonly modalService = inject(KbqModalService);

    openWithStringCaption(): void {
        this.modalService.create({
            kbqTitle: this.t().dialogTitle,
            kbqCaption: 'Additional context or description for the dialog',
            kbqContent: 'Modal body content',
            kbqOkText: 'Ok',
            kbqCancelText: this.t().cancel
        });
    }

    openWithTemplateCaption(kbqCaption: TemplateRef<object>): void {
        this.modalService.create({
            kbqTitle: this.t().longDialogTitle,
            kbqCaption,
            kbqContent: 'Modal body content',
            kbqOkText: 'Ok',
            kbqCancelText: this.t().cancel,
            kbqSize: ModalSize.Small
        });
    }

    constructor() {
        super(TRANSLATIONS);
    }
}
