// tslint:disable:no-console
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KbqModalRef, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Template Modal
 */
@Component({
    selector: 'modal-template-example',
    templateUrl: 'modal-template-example.html',
    styleUrls: ['modal-template-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ModalTemplateExample {
    tplModal: KbqModalRef;

    constructor(private modalService: KbqModalService) {}

    createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {
        this.modalService.create({
            kbqTitle: tplTitle,
            kbqContent: tplContent,
            kbqFooter: tplFooter,
            kbqOnOk: () => console.log('Click ok'),
        });
    }

    destroyTplModal() {
        this.tplModal.triggerOk();
        this.tplModal.destroy();
    }
}
