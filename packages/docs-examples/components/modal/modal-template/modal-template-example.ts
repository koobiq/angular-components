import { Component, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Modal template
 */
@Component({
    standalone: true,
    selector: 'modal-template-example',
    imports: [KbqButtonModule, KbqModalModule],
    template: `
        <button class="modal-example-button" (click)="createTplModal(tplTitle, tplContent, tplFooter)" kbq-button>
            Delete
        </button>

        <ng-template #tplTitle>
            <span>Заголовок окна</span>
        </ng-template>
        <ng-template #tplContent>
            Кибербезопасность сегодня — это целое направление информационных технологий, которое затрагивает практически
            все сферы жизни человека.
        </ng-template>
        <ng-template #tplFooter>
            <div class="layout-row flex-grow layout-align-space-between">
                <button (click)="destroyTplModal()" kbq-button>Доп. действие</button>

                <span>
                    <button [color]="'contrast'" (click)="destroyTplModal()" kbq-button kbq-modal-main-action>
                        Сохранить
                    </button>
                    <button (click)="destroyTplModal()" kbq-button>Отмена</button>
                </span>
            </div>
        </ng-template>
    `
})
export class ModalTemplateExample {
    tplModal: KbqModalRef;

    constructor(private modalService: KbqModalService) {}

    createTplModal(tplTitle: TemplateRef<object>, tplContent: TemplateRef<object>, tplFooter: TemplateRef<object>) {
        this.modalService.create({
            kbqTitle: tplTitle,
            kbqContent: tplContent,
            kbqFooter: tplFooter,
            kbqOnOk: () => console.log('Click ok')
        });
    }

    destroyTplModal() {
        this.tplModal.triggerOk();
        this.tplModal.destroy();
    }
}
