import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    inject,
    input,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { KbqDefaultSizes, kbqInjectNativeElement } from '@koobiq/components/core';
import {
    KbqEmptyState,
    KbqEmptyStateIcon,
    KbqEmptyStateText,
    KbqEmptyStateTitle
} from '@koobiq/components/empty-state';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';
import { fromEvent } from 'rxjs';
import { KbqDrop } from './primitives';

@Component({
    selector: 'kbq-file-upload-empty-state',
    imports: [
        KbqEmptyState,
        KbqEmptyStateIcon,
        KbqEmptyStateText,
        KbqEmptyStateTitle,
        KbqIcon
    ],
    template: `
        <kbq-empty-state class="kbq-multiple-file-upload__empty-state" [size]="size()">
            <i
                class="kbq-multiple-file-upload__empty-state-upload-icon"
                kbq-empty-state-icon
                kbq-icon="kbq-cloud-arrow-up-o_24"
            ></i>
            <div kbq-empty-state-title class="kbq-multiple-file-upload__empty-state-title">
                <ng-content select="[kbq-file-upload-title]" />
            </div>
            <div kbq-empty-state-text>
                <ng-content select="[kbq-file-upload-caption]" />
            </div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileUploadEmptyState {
    size = input<KbqDefaultSizes>('big');
}

@Component({
    selector: 'kbq-local-dropzone',
    imports: [
        KbqFileUploadEmptyState
    ],
    template: `
        <div class="kbq-dropzone__wrapper">
            <div class="kbq-loader-overlay__container">
                <kbq-file-upload-empty-state [size]="'compact'">
                    <div kbq-file-upload-title>Перетащите файлы</div>
                    <div kbq-file-upload-caption>SVG, PNG, JPG или GIF. Не более 2 MБ</div>
                </kbq-file-upload-empty-state>
            </div>
        </div>
    `,
    styleUrls: [
        '../loader-overlay/loader-overlay.scss',
        '../loader-overlay/loader-overlay-tokens.scss',
        'fullscreen-dropzone.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-local-dropzone kbq-dropzone'
    }
})
export class KbqLocalDropzone extends KbqLoaderOverlay {
    constructor(elementRef: ElementRef<HTMLElement>, renderer: Renderer2) {
        super(elementRef, renderer);

        this.size = 'normal';
    }
}

@Component({
    selector: 'kbq-dropzone-text',
    imports: [
        KbqFileUploadEmptyState
    ],
    template: `
        <div class="kbq-dropzone__wrapper">
            <kbq-file-upload-empty-state [size]="'compact'">
                <div kbq-file-upload-title>Перетащите файлы</div>
                <div kbq-file-upload-caption>SVG, PNG, JPG или GIF. Не более 2 MБ</div>
            </kbq-file-upload-empty-state>
        </div>
    `,
    styleUrls: ['./fullscreen-dropzone.scss'],
    host: {
        class: 'kbq-dropzone-text kbq-dropzone'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDropzoneText {}

@Directive({
    selector: '[kbqLocalDropzone]',
    exportAs: 'kbqLocalDropzone',
    host: { class: 'kbq-directive-local-dropzone' }
})
export class KbqLocalDropzoneDirective extends KbqDrop {
    private elementRef = kbqInjectNativeElement();
    private overlay: Overlay = inject(Overlay);
    private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
    private overlayRef?: OverlayRef;

    constructor() {
        super();

        fromEvent<DragEvent>(this.elementRef, 'dragenter').subscribe((event) => {
            event.preventDefault();
            event.stopPropagation();
            this.open();
        });
    }

    protected open() {
        if (this.overlayRef?.hasAttached()) return;

        this.overlayRef = this.overlay.create({
            hasBackdrop: false,
            width: this.elementRef.offsetWidth,
            height: this.elementRef.offsetHeight,
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(this.elementRef)
                .withFlexibleDimensions(false)
                .withPositions([
                    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }])
        });

        // @TODO: provide injector with locale data
        this.overlayRef.attach(new ComponentPortal(KbqDropzoneText, this.viewContainerRef));

        fromEvent<DragEvent>(this.overlayRef.overlayElement, 'dragover').subscribe((event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        fromEvent<DragEvent>(this.overlayRef.overlayElement, 'dragleave').subscribe((event) => {
            if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.close();
        });

        fromEvent<DragEvent>(this.overlayRef.overlayElement, 'drop').subscribe((event) => {
            this.onDrop(event);
            this.close();
        });

        setTimeout(() => {
            this.overlayRef?.overlayElement.querySelector('.kbq-dropzone')?.classList?.add('kbq-entering');
        });
    }

    close() {
        this.overlayRef?.dispose();
    }
}

@Component({
    selector: 'kbq-fullscreen-dropzone',
    imports: [
        KbqFileUploadEmptyState
    ],
    template: `
        <ng-template #overlayTpl>
            <div class="kbq-dropzone__wrapper">
                <kbq-file-upload-empty-state>
                    <div kbq-file-upload-title>Перетащите файлы</div>
                    <div kbq-file-upload-caption>SVG, PNG, JPG или GIF. Не более 2 MБ</div>
                </kbq-file-upload-empty-state>
            </div>
        </ng-template>
    `,
    styleUrls: ['./fullscreen-dropzone.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFullscreenDropzone {
    @ViewChild('overlayTpl') overlayTpl!: TemplateRef<unknown>;
    private overlayRef!: OverlayRef;
    protected readonly document = inject<Document>(DOCUMENT);

    constructor(
        private overlay: Overlay,
        private vcr: ViewContainerRef
    ) {
        fromEvent(this.document, 'dragenter').subscribe((event) => {
            event.preventDefault();
            event.stopPropagation();
            this.open();
        });

        fromEvent(this.document, 'dragover').subscribe((event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        fromEvent<DragEvent>(this.document, 'dragleave').subscribe((event) => {
            if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.close();
        });

        fromEvent(this.document, 'drop').subscribe((event) => {
            event.preventDefault();
            event.stopPropagation();
            this.close();
        });
    }

    open() {
        if (this.overlayRef?.hasAttached()) return;

        this.overlayRef = this.overlay.create({
            hasBackdrop: false,
            panelClass: ['kbq-dropzone', 'kbq-fullscreen-dropzone'],
            width: '100%',
            height: '100%',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
        });

        this.overlayRef.attach(new TemplatePortal(this.overlayTpl, this.vcr));

        setTimeout(() => {
            this.overlayRef.addPanelClass('kbq-entering');
        });
    }

    close() {
        this.overlayRef?.dispose();
    }
}
