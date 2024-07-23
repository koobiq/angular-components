import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
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
import { KbqOptionModule, PopUpPlacements, ThemePalette } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqToastComponent, KbqToastData, KbqToastModule, KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
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

        console.info('MyToastComponent: ');
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

    selectValue = '';

    position: KbqSidepanelPosition = KbqSidepanelPosition.Right;

    modalState: boolean = false;

    array = new Array(40);
    @ViewChild('sipanelTemplate', { static: false }) template: TemplateRef<any>;

    constructor(
        private toastService: KbqToastService,
        private modalService: KbqModalService,
        private sidepanelService: KbqSidepanelService,
        private overlayRef: OverlayContainer
    ) {
        console.info('overlayRef: ', overlayRef);
        console.info('overlayRef.getContainerElement(): ', overlayRef.getContainerElement());
        console.info('qwe: ', overlayRef.getContainerElement().childNodes.length);
        // console.info('overlayRef.hasAttached(): ', overlayRef.hasAttached());
    }

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: this.modalState
        });

        console.info('qwe: ', this.overlayRef.getContainerElement().childNodes.length);
    }

    showManyActonToast(controls: TemplateRef<any>) {
        this.toastService.show({ style: 'error', title: 'Заголовок', caption: controls }, 0);
    }

    showModal(kbqTitle: TemplateRef<any>, kbqContent: TemplateRef<any>): void {
        this.modalService.create({
            kbqTitle,
            kbqContent,
            kbqWidth: 400
        });
    }

    protected readonly popUpPlacements = PopUpPlacements;
}

@NgModule({
    declarations: [
        ToastDemoComponent,
        MyToastComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CdkScrollableModule,
        KbqButtonModule,
        KbqIconModule,
        KbqLinkModule,
        KbqToastModule,
        KbqProgressBarModule,
        KbqDropdownModule,
        KbqModalModule,
        KbqSidepanelModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqNavbarModule,
        KbqPopoverModule,
        KbqToolTipModule,
        KbqOptionModule,
        KbqSelectModule
    ],
    bootstrap: [ToastDemoComponent]
})
export class DemoModule {}
