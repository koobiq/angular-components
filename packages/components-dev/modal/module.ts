import { ChangeDetectionStrategy, Component, inject, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { ModalExamplesModule } from 'packages/docs-examples/components/modal';

@Component({
    selector: 'dev-examples',
    imports: [ModalExamplesModule],
    template: `
        <modal-overview-example />
        <hr />
        <modal-component-example />
        <hr />
        <modal-component-with-injector-example />
        <hr />
        <modal-template-example />
        <hr />
        <modal-scroll-example />
        <hr />
        <modal-sizes-example />
        <hr />
        <modal-multiple-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-modal-custom-long-component',
    imports: [],
    template: `
        @for (item of longText; track item) {
            <p>{{ item }}</p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevModalLongCustomComponent {
    longText: any = [];

    constructor() {
        for (let i = 0; i < 50; i++) {
            this.longText.push(`text lint - ${i}`);
        }
    }
}

@Component({
    selector: 'dev-modal-custom-component',
    imports: [KbqButtonModule],
    template: `
        <div>
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
            <p>
                <span>Get Modal instance in component</span>
                <button kbq-button [color]="componentColors.Contrast" (click)="destroyModal()">
                    destroy modal in the component
                </button>
            </p>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevModalCustomComponent {
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
    selector: 'dev-modal-full-custom-component',
    imports: [KbqModalModule, KbqButtonModule],
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
                <button kbq-button [color]="componentColors.Contrast" (click)="destroyModal()">
                    destroy modal in the component
                </button>
            </p>
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="componentColors.Contrast">Save</button>
            <button kbq-button autofocus (click)="destroyModal()">Close</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevModalFullCustomComponent {
    componentColors = KbqComponentColors;

    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: KbqModalRef) {}

    destroyModal() {
        this.modal.destroy({ data: 'this the result data' });
    }
}

@Component({
    selector: 'dev-app',
    imports: [
        KbqModalModule,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqToolTipModule,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
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
            kbqComponent: DevModalFullCustomComponent
        });
    }

    createLongModal() {
        this.modalService.create({
            kbqTitle: 'Modal Title',
            kbqContent: DevModalLongCustomComponent,
            kbqOkText: 'Yes',
            kbqCancelText: 'No',
            kbqSize: ModalSize.Small
        });
    }

    createModalWithLongTitle() {
        const ref = this.modalService.create({
            kbqTitle: 'Modal Title Modal Title Modal Title Modal Title Modal Title Modal Title',
            kbqContent: DevModalLongCustomComponent,
            kbqOkText: 'Yes',
            kbqOnOk: () => ref.close(),
            kbqCancelText: 'No',
            kbqSize: ModalSize.Small
        });
    }

    createModalWithLongTitleTemplate(longHeader: TemplateRef<any>) {
        this.modalService.create({
            kbqTitle: longHeader,
            kbqContent: DevModalLongCustomComponent,
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
            kbqContent: DevModalCustomComponent,
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

        setTimeout(() => this.modalService.closeAll(), 5000);
    }

    destroyTplModal() {
        this.tplModal.destroy();
    }
}
