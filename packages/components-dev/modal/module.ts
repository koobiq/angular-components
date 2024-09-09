import { Component, inject, Input, NgModule, TemplateRef, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqModalModule, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KBQ_MODAL_DATA } from '../../components/modal/modal.service';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModalDemoComponent {
    componentColors = KbqComponentColors;

    isVisible = false;
    tplModal: KbqModalRef;
    htmlModalVisible = false;

    isLoading = false;

    constructor(private modalService: KbqModalService) {}

    showConfirm() {
        this.modalService.success({
            kbqSize: ModalSize.Small,
            kbqRestoreFocus: false,
            kbqMaskClosable: true,
            kbqContent: 'Сохранить сделанные изменения в запросе "Все активы с виндой"?',
            kbqOkText: 'Сохранить',
            kbqCancelText: 'Отмена',
            kbqOnOk: () => console.log('OK')
        });
    }

    showDeleteConfirm() {
        this.modalService.delete({
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent:
                'The selected action "Send to Arbor" is used in a rule' +
                ' or an alert. It will be <b>deleted</b> there too. </br></br>' +
                'Delete the selected action anyway?',
            kbqOkText: 'Delete',
            kbqCancelText: 'Cancel',
            kbqWidth: '480px',
            kbqOnOk: () => console.log('Delete'),
            kbqOnCancel: () => console.log('Cancel')
        });

        this.showConfirm();
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    createTplModal(tplContent?: TemplateRef<{}>, tplTitle?: TemplateRef<{}>, tplFooter?: TemplateRef<{}>) {
        this.tplModal = this.modalService.create({
            kbqTitle: tplTitle,
            kbqContent: tplContent,
            kbqFooter: tplFooter,
            kbqClosable: true,
            kbqOnOk: () => console.log('Click ok')
        });
    }

    createModalComponent() {
        this.modalService.open({
            kbqComponent: KbqModalFullCustomComponent
        });
    }

    createLongModal() {
        this.modalService.create({
            kbqTitle: 'Modal Title',
            kbqContent: KbqModalLongCustomComponent,
            kbqOkText: 'Yes',
            kbqCancelText: 'No',
            kbqSize: ModalSize.Small
        });
    }

    createModalWithLongTitle() {
        const ref = this.modalService.create({
            kbqTitle: 'Modal Title Modal Title Modal Title Modal Title Modal Title Modal Title',
            kbqContent: KbqModalLongCustomComponent,
            kbqOkText: 'Yes',
            kbqOnOk: () => ref.close(),
            kbqCancelText: 'No',
            kbqSize: ModalSize.Small
        });
    }

    createModalWithLongTitleTemplate(longHeader: TemplateRef<any>) {
        this.modalService.create({
            kbqTitle: longHeader,
            kbqContent: KbqModalLongCustomComponent,
            kbqOkText: 'Yes',
            kbqCancelText: 'No',
            kbqSize: ModalSize.Small
        });
    }

    createComponentModal() {
        let isLoading = false;
        const isShown = false;

        const modal = this.modalService.create({
            kbqTitle: 'Modal Title',
            kbqContent: KbqModalCustomComponent,
            kbqComponentParams: {
                title: 'title in component',
                subtitle: 'component sub title，will be changed after 2 sec'
            },
            kbqFooter: [
                {
                    label: 'button 1',
                    type: 'primary',
                    kbqModalMainAction: true,
                    loading: () => isLoading,
                    onClick: (componentInstance: any) => {
                        componentInstance.title = 'title in inner component is changed';
                    }
                },
                {
                    label: 'button 2',
                    type: 'primary',
                    autoFocus: true,
                    show: () => isShown,
                    onClick: (componentInstance: any) => {
                        componentInstance.title = 'title in inner component is changed';
                    }
                }
            ],
            data: { myData: 'myData' }
        });

        modal.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');

            isLoading = true;
            setTimeout(() => (isLoading = false), 3000);
            //
            // let isDisabled = true;
            // setTimeout(() => isDisabled = false, 2000);

            // isShown = true;
            // setTimeout(() => isShown = false, 4000);
        });

        // Return a result when closed
        modal.afterClose.subscribe((result) => console.log('[afterClose] The result is:', result));

        // delay until modal instance created
        setTimeout(() => {
            const instance = modal.getContentComponent();
            instance.subtitle = 'sub title is changed';
            modal.markForCheck();
        }, 2000);
    }

    openAndCloseAll() {
        let pos = 0;

        ['create', 'delete', 'success'].forEach((method) =>
            this.modalService[method]({
                kbqOkText: 'Confirm',
                kbqCancelText: 'Cancel',
                kbqMask: false,
                kbqContent: `Test content: <b>${method}</b>`,
                kbqStyle: { position: 'absolute', top: `${pos * 70}px`, left: `${pos++ * 300}px` }
            })
        );

        this.htmlModalVisible = true;

        this.modalService.afterAllClose.subscribe(() => console.log('afterAllClose emitted!'));

        window.setTimeout(() => this.modalService.closeAll(), 5000);
    }

    destroyTplModal() {
        this.tplModal.destroy();
    }
}

@Component({
    selector: 'kbq-modal-custom-long-component',
    template: `
        <ng-container *ngFor="let item of longText">
            <p>{{ item }}</p>
        </ng-container>
    `
})
export class KbqModalLongCustomComponent {
    longText: any = [];

    constructor() {
        for (let i = 0; i < 50; i++) {
            this.longText.push(`text lint - ${i}`);
        }
    }
}

@Component({
    selector: 'kbq-modal-custom-component',
    template: `
        <div>
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
            <p>
                <span>Get Modal instance in component</span>
                <button
                    [color]="componentColors.Contrast"
                    (click)="destroyModal()"
                    kbq-button
                >
                    destroy modal in the component
                </button>
            </p>
        </div>
    `
})
export class KbqModalCustomComponent {
    componentColors = KbqComponentColors;

    data = inject(KBQ_MODAL_DATA);

    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: KbqModalRef) {
        console.log('data: ', this.data);
    }

    destroyModal() {
        this.modal.destroy({ data: 'this the result data' });
    }
}

@Component({
    selector: 'kbq-modal-full-custom-component',
    template: `
        <kbq-modal-title>
            Modal Title,Modal Title,Modal Title,Modal Title,Modal Title,Modal Title,Modal Title,Modal Title,Modal
            Title,Modal Title,Modal Title,Modal Title,
        </kbq-modal-title>

        <kbq-modal-body>
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
            <p>
                <span>Get Modal instance in component</span>
                <button
                    [color]="componentColors.Contrast"
                    (click)="destroyModal()"
                    kbq-button
                >
                    destroy modal in the component
                </button>
            </p>
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button
                [color]="componentColors.Contrast"
                kbq-button
            >
                Save
            </button>
            <button
                (click)="destroyModal()"
                kbq-button
                autofocus
            >
                Close
            </button>
        </div>
    `
})
export class KbqModalFullCustomComponent {
    componentColors = KbqComponentColors;

    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: KbqModalRef) {}

    destroyModal() {
        this.modal.destroy({ data: 'this the result data' });
    }
}

@NgModule({
    declarations: [
        ModalDemoComponent,
        KbqModalCustomComponent,
        KbqModalLongCustomComponent,
        KbqModalFullCustomComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqModalModule,
        KbqDropdownModule,
        KbqToolTipModule
    ],
    bootstrap: [ModalDemoComponent]
})
export class DemoModule {}
