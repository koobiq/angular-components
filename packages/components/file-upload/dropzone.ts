import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    effect,
    inject,
    Injectable,
    InjectionToken,
    Injector,
    input,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqDefaultSizes,
    kbqInjectNativeElement,
    ruRULocaleData
} from '@koobiq/components/core';
import {
    KbqEmptyState,
    KbqEmptyStateIcon,
    KbqEmptyStateText,
    KbqEmptyStateTitle
} from '@koobiq/components/empty-state';
import { KbqIcon } from '@koobiq/components/icon';
import { fromEvent, of, Subject, takeUntil } from 'rxjs';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqDrop } from './primitives';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

export type KbqDropzoneData = { caption?: string; size?: KbqDefaultSizes; title?: string };

/** Injection token that can be used to access the data that was passed in to a modal. */
export const KBQ_DROPZONE_DATA = new InjectionToken<KbqDropzoneData>('KbqDropzoneData');

/**
 * Service that provides full-screen drag-and-drop overlay functionality.
 */
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

    /**
     * Initializes drag-and-drop event listeners on the document body.
     * @param config - Dropzone configuration
     */
    init(config?: KbqDropzoneData): void {
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

    /** Stops all drag-and-drop event listeners and cleans up subscriptions. */
    stop(): void {
        this.stopDrop.next();
    }

    /**
     * Opens the dropzone overlay.
     * @param config - Dropzone configuration
     */
    open(config?: KbqDropzoneData): void {
        if (this.overlayRef?.hasAttached()) return;

        this.overlayRef = this.createOverlay();

        let injector: Injector | null = null;

        if (config) {
            injector = Injector.create({
                parent: this.injector,
                providers: [{ provide: KBQ_DROPZONE_DATA, useValue: config }]
            });
        }

        this.overlayRef.attach(new ComponentPortal(KbqDropzoneContent, undefined, injector));

        setTimeout(() => this.overlayRef?.addPanelClass('kbq-dropzone-overlay__attached'));
    }
    /** Closes and disposes the overlay. */
    close(): void {
        this.overlayRef?.dispose();
    }

    /** @docs-private */
    protected createOverlay(): OverlayRef {
        return this.overlay.create({
            hasBackdrop: false,
            panelClass: ['kbq-dropzone-overlay', 'kbq-fullscreen-dropzone'],
            width: '100%',
            height: '100%',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
        });
    }
}

@Directive({
    selector: '[kbqLocalDropzone]',
    exportAs: 'kbqLocalDropzone',
    host: { class: 'kbq-local-dropzone__trigger' }
})
export class KbqLocalDropzone extends KbqDrop {
    /** File upload component to connect dropped files to */
    readonly connectedTo = input<KbqSingleFileUploadComponent | KbqMultipleFileUploadComponent>(undefined, {
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

    /** Opens the dropzone overlay positioned over the host element. */
    open(config?: KbqDropzoneData): void {
        if (this.overlayRef?.hasAttached()) return;

        this.overlayRef = this.createOverlay();

        let injector: Injector | null = null;

        if (config) {
            injector = Injector.create({
                parent: this.injector,
                providers: [{ provide: KBQ_DROPZONE_DATA, useValue: config }]
            });
        }

        this.overlayRef.attach(new ComponentPortal(KbqDropzoneContent, this.viewContainerRef, injector));

        this.init();

        setTimeout(() => this.overlayRef?.addPanelClass('kbq-dropzone-overlay__attached'));
    }

    /** Closes and disposes the overlay. */
    close(): void {
        this.overlayRef?.dispose();
    }

    /**
     * Initializes drag-and-drop event listeners on the overlay element.
     * Handles dragover, dragleave, and drop events to manage overlay state and file drops.
     */
    protected init(): void {
        if (!this.overlayRef) return;

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
    }

    /** Creates an overlay positioned and sized to match the host element. */
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

/** Component that displays an empty state for file upload areas. */
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
        @if (title()) {
            <div kbq-empty-state-title>{{ title() }}</div>
        }
        @let captionText = caption();
        @if (captionText) {
            <div kbq-empty-state-text>
                @if (isTemplateRef(captionText)) {
                    <ng-container [ngTemplateOutlet]="$any(captionText)" />
                } @else if (captionText) {
                    {{ captionText }}
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
    /** Title text to display below the upload icon */
    title = input<string>();
    /** Caption text or template to display below the title */
    caption = input<string | TemplateRef<any>>();

    constructor() {
        super();
        this.size = 'big';
    }

    /** @docs-private */
    protected isTemplateRef(value: string | TemplateRef<any>): boolean {
        return value instanceof TemplateRef;
    }
}

@Component({
    selector: 'kbq-dropzone-component',
    imports: [KbqFileUploadEmptyState],
    template: `
        <kbq-file-upload-empty-state
            [size]="config?.size ?? 'normal'"
            [title]="config?.title ?? title()"
            [caption]="config?.caption ?? ''"
        />
    `,
    styleUrls: ['./dropzone.scss'],
    host: {
        class: 'kbq-dropzone-content'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDropzoneContent {
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    /** @docs-private */
    protected readonly config = inject<KbqDropzoneData>(KBQ_DROPZONE_DATA, { optional: true });
    private readonly localeId = toSignal(this.localeService?.changes.asObservable() ?? of(KBQ_DEFAULT_LOCALE_ID));

    /** @docs-private */
    protected readonly title = computed(() => {
        return this.localeService && this.localeId()
            ? this.localeService.getParams('fileUpload').multiple.title
            : ruRULocaleData.fileUpload.multiple.title;
    });
}
