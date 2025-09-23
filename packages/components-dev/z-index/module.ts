import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
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

@Component({
    standalone: true,
    selector: 'dev-toast-component',
    template: '<div>DevToastComponent</div>',
    host: {
        class: 'dev-toast-component'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevToastComponent extends KbqToastComponent {
    constructor(
        readonly data: KbqToastData,
        readonly service: KbqToastService,
        elementRef: ElementRef<HTMLElement>,
        focusMonitor: FocusMonitor
    ) {
        super(data, service, elementRef, focusMonitor);
    }
}

@Component({
    standalone: true,
    imports: [
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
        KbqSelectModule,
        NgTemplateOutlet
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
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
        console.log('overlayRef: ', overlayRef);
        console.log('overlayRef.getContainerElement(): ', overlayRef.getContainerElement());
        console.log('qwe: ', overlayRef.getContainerElement().childNodes.length);
        // console.log('overlayRef.hasAttached(): ', overlayRef.hasAttached());
    }

    openTemplateSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: this.modalState
        });

        console.log('qwe: ', this.overlayRef.getContainerElement().childNodes.length);
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
