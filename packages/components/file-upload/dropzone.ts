import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    effect,
    inject,
    Injectable,
    InjectionToken,
    Injector,
    Input,
    input,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

export type KbqDropzoneData = { caption?: string; size: KbqDefaultSizes; title: string; type?: 'dragover' | 'error' };

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

    constructor() {
        super();
    }

    init(config: KbqDropzoneData) {
        fromEvent<DragEvent>(this.document.body, 'dragenter')
            .pipe(takeUntil(this.stopDrop))
            .subscribe((event) => {
                event.preventDefault();
                event.stopPropagation();
                this.open(config);
            });

        fromEvent<DragEvent>(this.document.body, 'dragover')
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

    private open(config: KbqDropzoneData) {
        if (this.overlayRef?.hasAttached()) return;

        this.overlayRef = this.overlay.create({
            hasBackdrop: false,
            panelClass: ['kbq-dropzone-overlay', 'kbq-fullscreen-dropzone'],
            width: '100%',
            height: '100%',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
        });

        const injector = Injector.create({
            parent: this.injector,
            providers: [{ provide: KBQ_DROPZONE_DATA, useValue: config }]
        });

        this.overlayRef.attach(new ComponentPortal(KbqDropzoneComponent, undefined, injector));

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
        KbqEmptyStateIcon,
        KbqEmptyStateTitle,
        KbqEmptyStateText,
        KbqIcon,
        NgTemplateOutlet
    ],
    template: `
        <i
            class="kbq-multiple-file-upload__empty-state-upload-icon"
            kbq-empty-state-icon
            kbq-icon="kbq-cloud-arrow-up-o_24"
        ></i>
        @if (title) {
            <div kbq-empty-state-title>{{ title }}</div>
        }
        @if (caption) {
            <div kbq-empty-state-text>
                @if (isTemplateRef(caption)) {
                    <ng-container [ngTemplateOutlet]="$any(caption)" />
                } @else if (caption) {
                    {{ caption }}
                }
            </div>
        }
    `,
    styles: `
        .kbq-empty-state.kbq-multiple-file-upload__empty-state {
            --kbq-empty-state-size-normal-image-margin-bottom: var(--kbq-size-m);
            --kbq-empty-state-size-normal-title-margin-bottom: var(--kbq-size-xs);
        }
    `,
    host: {
        class: 'kbq-multiple-file-upload__empty-state'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileUploadEmptyState extends KbqEmptyState {
    @Input() title: string;
    @Input() caption: string | TemplateRef<any>;
    @Input() size: KbqDefaultSizes = 'big';

    constructor() {
        super();
    }

    protected isTemplateRef(value: string | TemplateRef<any>): boolean {
        return value instanceof TemplateRef;
    }
}

@Component({
    selector: 'kbq-dropzone-component',
    imports: [KbqFileUploadEmptyState],
    template: `
        <kbq-file-upload-empty-state [size]="config.size" [title]="config.title" [caption]="config.caption" />
    `,
    styleUrls: ['./dropzone.scss'],
    host: {
        class: 'kbq-dropzone-component'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDropzoneComponent {
    elementRef = kbqInjectNativeElement();

    config = inject<{ caption: string; size: KbqDefaultSizes; title: string }>(KBQ_DROPZONE_DATA);
}

@Directive({
    selector: '[kbqLocalDropzone]',
    exportAs: 'kbqLocalDropzone',
    host: { class: 'kbq-local-dropzone__trigger' }
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

        fromEvent<DragEvent>(this.elementRef, 'dragenter')
            .pipe(takeUntilDestroyed())
            .subscribe((event) => {
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

        this.overlayRef = this.createOverlay();

        const injector = Injector.create({
            parent: this.injector,
            providers: [{ provide: KBQ_DROPZONE_DATA, useValue: this.localeConfig }]
        });

        this.overlayRef.attach(new ComponentPortal(KbqDropzoneComponent, this.viewContainerRef, injector));

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

        setTimeout(() => this.overlayRef?.addPanelClass('kbq-entering'));
    }

    close() {
        this.overlayRef?.dispose();
    }

    protected createOverlay(): OverlayRef {
        return this.overlay.create({
            hasBackdrop: false,
            panelClass: ['kbq-dropzone-overlay', 'kbq-local-dropzone'],
            width: this.elementRef.offsetWidth,
            height: this.elementRef.offsetHeight,
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(this.elementRef)
                .withFlexibleDimensions(false)
                .withPositions([
                    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }])
        });
    }
}
