import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    effect,
    inject,
    Injectable,
    InjectionToken,
    Injector,
    input,
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
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqDrop } from './primitives';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

export type KbqDropzoneData = { caption: string; size: KbqDefaultSizes; title: string; type?: 'dragover' | 'error' };

/** Injection token that can be used to access the data that was passed in to a modal. */
export const KBQ_DROPZONE_DATA = new InjectionToken<KbqDropzoneData>('KbqDropzoneData');

@Injectable({
    providedIn: 'root'
})
export class KbqFullScreenDropzoneService extends KbqDrop {
    private readonly overlay: Overlay = inject(Overlay);
    private readonly document = inject<Document>(DOCUMENT);
    private readonly injector = inject(Injector);
    private readonly stopDrop = new Subject<void>();
    private overlayRef?: OverlayRef;

    init(config: KbqDropzoneData) {
        fromEvent(this.document.body, 'dragenter')
            .pipe(takeUntil(this.stopDrop))
            .subscribe((event) => {
                event.preventDefault();
                event.stopPropagation();
                this.open(config);
            });

        fromEvent(this.document.body, 'dragover')
            .pipe(takeUntil(this.stopDrop))
            .subscribe((event) => {
                event.preventDefault();
                event.stopPropagation();
            });

        fromEvent<DragEvent>(this.document.body, 'dragleave')
            .pipe(takeUntil(this.stopDrop))
            .subscribe((event) => {
                if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement)) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                this.close();
            });

        fromEvent<DragEvent>(this.document.body, 'drop')
            .pipe(takeUntil(this.stopDrop))
            .subscribe((event) => {
                this.onDrop(event);
                this.close();
            });
    }

    stop() {
        this.stopDrop.next();
    }

    private open(config: { caption: string; size: string; title: string }) {
        if (this.overlayRef?.hasAttached()) return;

        this.overlayRef = this.overlay.create({
            hasBackdrop: false,
            panelClass: ['kbq-dropzone', 'kbq-fullscreen-dropzone'],
            width: '100%',
            height: '100%',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
        });

        const injector = Injector.create({
            parent: this.injector,
            providers: [{ provide: KBQ_DROPZONE_DATA, useValue: config }]
        });

        this.overlayRef.attach(new ComponentPortal(KbqDropzoneText, undefined, injector));

        setTimeout(() => {
            this.overlayRef?.addPanelClass('kbq-entering');
        });
    }

    private close() {
        this.overlayRef?.dispose();
    }
}

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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileUploadEmptyState {
    size = input<KbqDefaultSizes>('big');
}

@Component({
    selector: 'kbq-dropzone-text',
    imports: [
        KbqFileUploadEmptyState
    ],
    template: `
        <div class="kbq-dropzone__wrapper">
            <kbq-file-upload-empty-state [size]="config.size">
                <div kbq-file-upload-title>{{ config.title }}</div>
                <div kbq-file-upload-caption>{{ config.caption }}</div>
            </kbq-file-upload-empty-state>
        </div>
    `,
    styleUrls: ['./dropzone.scss'],
    host: {
        class: 'kbq-dropzone-text kbq-dropzone'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDropzoneText {
    elementRef = kbqInjectNativeElement();

    config = inject<{ caption: string; size: KbqDefaultSizes; title: string }>(KBQ_DROPZONE_DATA);
}

@Directive({
    selector: '[kbqLocalDropzone]',
    exportAs: 'kbqLocalDropzone',
    host: { class: 'kbq-directive-local-dropzone' }
})
export class KbqLocalDropzone extends KbqDrop {
    localeConfig: KbqDropzoneData = {
        title: 'Перетащите файлы',
        caption: 'SVG, PNG, JPG или GIF. Не более 2 MБ',
        size: 'compact'
    };

    connectedTo = input<KbqSingleFileUploadComponent | KbqMultipleFileUploadComponent>(undefined, {
        alias: 'kbqConnectedTo'
    });

    private elementRef = kbqInjectNativeElement();
    private overlay: Overlay = inject(Overlay);
    private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
    private injector = inject(Injector);
    private overlayRef?: OverlayRef;

    constructor() {
        super();

        fromEvent<DragEvent>(this.elementRef, 'dragenter').subscribe((event) => {
            event.preventDefault();
            event.stopPropagation();
            this.open();
        });

        effect(() => {
            const connectedTo = this.connectedTo();

            if (connectedTo) {
                this.filesDropped.subscribe((files) => connectedTo.onFileDropped(files));
            }
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

        const injector = Injector.create({
            parent: this.injector,
            providers: [{ provide: KBQ_DROPZONE_DATA, useValue: this.localeConfig }]
        });

        this.overlayRef.attach(new ComponentPortal(KbqDropzoneText, this.viewContainerRef, injector));

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
            this.overlayRef?.overlayElement?.querySelector('.kbq-dropzone')?.classList?.add('kbq-entering');
        });
    }

    close() {
        this.overlayRef?.dispose();
    }
}
