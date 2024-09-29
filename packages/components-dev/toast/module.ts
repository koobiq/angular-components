import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    NgModule,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import {
    KBQ_TOAST_CONFIG,
    KbqToastComponent,
    KbqToastData,
    KbqToastModule,
    KbqToastPosition,
    KbqToastService,
    KbqToastStyle
} from '@koobiq/components/toast';
import { KbqButtonModule } from '../../components/button';

@Component({
    selector: 'kbq-new-toast',
    template: '<div>MyToastComponent</div>',
    host: {
        class: 'my-toast'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MyToastComponent extends KbqToastComponent {
    constructor(
        readonly data: KbqToastData,
        readonly service: KbqToastService,
        elementRef: ElementRef,
        focusMonitor: FocusMonitor
    ) {
        super(data, service, elementRef, focusMonitor);

        console.log('MyToastComponent: ');
    }
}

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToastDemoComponent {
    themePalette = ThemePalette;

    position: KbqSidepanelPosition = KbqSidepanelPosition.Right;

    modalState: boolean = false;

    array = new Array(40);
    @ViewChild('sipanelTemplate', { static: false }) template: TemplateRef<any>;

    constructor(
        private toastService: KbqToastService,
        private newToastService: KbqToastService<MyToastComponent>,
        private modalService: KbqModalService,
        private sidepanelService: KbqSidepanelService
    ) {}

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: this.modalState
        });
    }

    showInfoToast(actions: TemplateRef<any>) {
        this.toastService.show({
            title: 'Доступно обновление агента',
            caption: 'Версия 2.03.15 от 15 мая 2022',
            actions
        });
    }

    showErrorToast(actions: TemplateRef<any>) {
        this.toastService.show({ style: 'error', title: 'Не удалось авторизовать 15 агентов', actions, icon: true });
    }

    showErrorCustomIconToast(actions: TemplateRef<any>) {
        this.toastService.show({
            style: 'error',
            title: 'Не удалось авторизовать 15 агентов',
            actions,
            icon: true,
            iconClass: 'kbq-exclamation-triangle_16'
        });
    }

    showIconAndCaption() {
        this.toastService.show({ caption: 'Не удалось авторизовать 15 агентов' });
    }

    showOnlyCaption() {
        this.toastService.show({
            caption: 'Не удалось авторизовать 15 агентов',
            icon: false,
            closeButton: false
        });
    }

    showStickyToast(content: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show(
            {
                title: 'Импорт файлов',
                caption: '12,1 МБ из 85 МБ — осталось 15 мин  ',
                closeButton: false,
                content,
                actions
            },
            0
        );
    }

    showSingleActonToast(caption: TemplateRef<any>, actions: TemplateRef<any>, closeButton) {
        this.toastService.show({ caption, actions, closeButton }, 0);
    }

    showTwoActonToast(actions: TemplateRef<any>) {
        this.toastService.show({ title: 'Доступно обновление компонентов', actions });
    }

    showManyActonToast(actions: TemplateRef<any>) {
        this.toastService.show(
            { style: 'error', title: 'Заголовок', caption: 'Подзаголовок, подробности', actions },
            0
        );
    }

    showToastWithInlineLink(caption: TemplateRef<any>) {
        this.toastService.show({ caption });
    }

    showToastWithLongText() {
        this.toastService.show({ caption: 'Longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglongtext' });
    }

    showToast(style: KbqToastStyle | string) {
        this.toastService.show({ style, title: style, caption: 'Message Content' });
    }

    showToastWithTemplates(
        style: KbqToastStyle | string,
        icon: TemplateRef<any>,
        title: TemplateRef<any>,
        caption: TemplateRef<any>,
        content: TemplateRef<any>,
        actions: TemplateRef<any>
    ) {
        this.toastService.show({ style, icon, title, caption, content, actions, closeButton: true }, 0);
    }

    showNewToast() {
        this.newToastService.show({ title: 'default style (contrast)', caption: 'Message Content' });
    }

    showTemplate(template: TemplateRef<any>) {
        this.toastService.showTemplate({ title: 'default style (contrast)', caption: 'Message Content' }, template);
    }

    showModal(kbqTitle: TemplateRef<any>, kbqContent: TemplateRef<any>, kbqFooter: TemplateRef<any>): void {
        this.modalService.create({
            kbqTitle,
            kbqContent,
            kbqFooter,
            kbqWidth: 400
        });
    }
}

@NgModule({
    declarations: [
        ToastDemoComponent,
        MyToastComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqLinkModule,
        KbqToastModule,
        KbqProgressBarModule,
        KbqDropdownModule,
        KbqModalModule,
        KbqSidepanelModule,
        KbqScrollbarModule
    ],
    bootstrap: [ToastDemoComponent],
    providers: [
        {
            provide: KBQ_TOAST_CONFIG,
            useValue: {
                position: KbqToastPosition.TOP_RIGHT,
                duration: 5000,
                delay: 2000,
                onTop: false
            }
        }
        // {
        //     provide: KbqToastComponent,
        //     useFactory: () => MyToastComponent
        // }
    ]
})
export class DemoModule {}
