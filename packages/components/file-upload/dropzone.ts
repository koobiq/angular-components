import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    Directive,
    inject,
    Injectable,
    InjectionToken,
    Injector,
    input,
    NgZone,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
    isSafari,
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KBQ_WINDOW,
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
import { filter, fromEvent, of, Subject, takeUntil } from 'rxjs';
import { KbqMultipleFileUploadComponent } from './multiple-file-upload.component';
import { KbqDrop } from './primitives';
import { KbqSingleFileUploadComponent } from './single-file-upload.component';

export type KbqDropzoneData = { caption?: string; size?: KbqDefaultSizes; title?: string };

/** Injection token that can be used to access the data that was passed in to a modal. */
export const KBQ_DROPZONE_DATA = new InjectionToken<KbqDropzoneData>('KbqDropzoneData');

/**
 * Determines if a mouse event occurred outside the viewport boundaries.
 * @docs-private
 */
export const isOutsideViewport = ({
    event,
    innerWidth,
    innerHeight,
    xAxisMinThreshold,
    yAxisMinThreshold
}: {
    event: MouseEvent;
    innerWidth: number;
    innerHeight: number;
    xAxisMinThreshold: number;
    yAxisMinThreshold: number;
}): boolean => {
    return (
        event.clientX <= xAxisMinThreshold ||
        event.clientY <= yAxisMinThreshold ||
        event.clientX >= innerWidth ||
        event.clientY >= innerHeight
    );
};

/**
 * Service that provides full-screen drag-and-drop overlay functionality.
 */
@Injectable({
    providedIn: 'root'
})
export class KbqFullScreenDropzoneService extends KbqDrop {
    /** Completely terminates all subscriptions when emitted */
    private readonly dropAbort = new Subject<void>();
    private readonly overlay: Overlay = inject(Overlay);
    private readonly window = inject(KBQ_WINDOW);
    private readonly injector = inject(Injector);
    private readonly ngZone = inject(NgZone);
    private overlayRef?: OverlayRef;

    constructor() {
        super();
    }

    /**
     * Initializes drag-and-drop event listeners on the document body.
     * @param config - Dropzone configuration
     */
    init(config?: KbqDropzoneData): void {
        this.ngZone.runOutsideAngular(() => {
            fromEvent<DragEvent>(this.window.document.body, 'dragenter')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntil(this.dropAbort)
                )
                .subscribe((event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.open(config);
                });

            fromEvent<DragEvent>(this.window.document.body, 'dragover')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntil(this.dropAbort)
                )
                .subscribe((event) => {
                    event.preventDefault();
                    event.stopPropagation();
                });

            fromEvent<DragEvent>(this.window.document.body, 'dragleave')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntil(this.dropAbort)
                )
                .subscribe((event) => this.onDragLeave(event));

            fromEvent<DragEvent>(this.window.document.body, 'drop')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntil(this.dropAbort)
                )
                .subscribe((event) => {
                    this.ngZone.run(() => this.onDrop(event));
                });
        });
    }

    /** Stops all drag-and-drop event listeners and cleans up subscriptions. */
    stop(): void {
        this.dropAbort.next();
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
    onDrop(event: DragEvent): void {
        super.onDrop(event);
        this.close();
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

    /** @see https://bugs.webkit.org/show_bug.cgi?id=66547 */
    private onDragLeave(event: DragEvent): void {
        const isWithinViewport = isSafari(this.window.navigator.userAgent)
            ? !isOutsideViewport({
                  event,
                  innerWidth: this.window.innerWidth,
                  innerHeight: this.window.innerHeight,
                  xAxisMinThreshold: 0,
                  yAxisMinThreshold: 0
              })
            : (event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement);

        if (isWithinViewport) return;

        event.preventDefault();
        event.stopPropagation();
        this.close();
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

    private readonly elementRef = kbqInjectNativeElement();
    private readonly rects = this.elementRef.getBoundingClientRect();
    private readonly overlay: Overlay = inject(Overlay);
    private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
    private readonly injector = inject(Injector);
    private readonly window = inject(KBQ_WINDOW);
    private readonly ngZone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);
    private overlayRef?: OverlayRef;

    constructor() {
        super();

        this.filesDropped.subscribe((files) => this.connectedTo()?.onFileDropped(files));

        fromEvent<DragEvent>(this.elementRef, 'dragenter')
            .pipe(takeUntilDestroyed())
            .subscribe((event) => {
                event.preventDefault();
                event.stopPropagation();
                this.open();
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
        this.ngZone.runOutsideAngular(() => {
            if (!this.overlayRef) return;
            fromEvent<DragEvent>(this.overlayRef.overlayElement, 'dragover')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((event) => {
                    event.preventDefault();
                    event.stopPropagation();
                });

            fromEvent<DragEvent>(this.overlayRef.overlayElement, 'dragleave')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((event) => this.onDragLeave(event));

            fromEvent<DragEvent>(this.overlayRef.overlayElement, 'drop')
                .pipe(
                    filter(() => !this.disabled()),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((event) => this.onDrop(event));
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

    /** @docs-private */
    onDrop(event: DragEvent) {
        super.onDrop(event);
        this.close();
    }

    private onDragLeave(event: DragEvent): void {
        const isWithinViewport = isSafari(this.window.navigator.userAgent)
            ? !isOutsideViewport({
                  event,
                  innerWidth: this.rects.x + this.elementRef.offsetWidth,
                  innerHeight: this.rects.y + this.elementRef.offsetHeight,
                  xAxisMinThreshold: this.rects.x,
                  yAxisMinThreshold: this.rects.y
              })
            : (event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement);

        if (isWithinViewport) return;

        event.preventDefault();
        event.stopPropagation();
        this.close();
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
    styleUrls: ['./dropzone.scss', '../empty-state/empty-state.scss'],
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
    selector: 'kbq-dropzone-content',
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
