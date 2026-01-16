import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';
import { fromEvent } from 'rxjs';
import { KbqFileDropDirective } from './primitives';

@Component({
    selector: 'kbq-local-dropzone',
    hostDirectives: [
        KbqFileDropDirective
    ],
    template: `
        <div class="kbq-dropzone__wrapper">
            <div class="kbq-loader-overlay__container">
                <ng-content>Hello world</ng-content>
            </div>
        </div>
    `,
    styleUrls: [
        '../loader-overlay/loader-overlay.scss',
        '../loader-overlay/loader-overlay-tokens.scss',
        'fullscreen-dropzone.scss'
    ],
    host: {
        class: 'kbq-local-dropzone'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLocalDropzone extends KbqLoaderOverlay {
    constructor(elementRef: ElementRef<HTMLElement>, renderer: Renderer2) {
        super(elementRef, renderer);

        this.size = 'normal';
    }
}

@Component({
    selector: 'kbq-fullscreen-dropzone',
    template: `
        <ng-template #overlayTpl>
            <div>
                <h2>Fullscreen Overlay</h2>
                <button (click)="close()">Close</button>
            </div>
        </ng-template>
    `,
    styles: `
        ::ng-deep .kbq-dropzone {
            background: hsla(216, 100%, 24%, 50%);
        }
    `
})
export class KbqFullscreenDropzoneComponent {
    @ViewChild('overlayTpl') overlayTpl!: TemplateRef<unknown>;
    private overlayRef!: OverlayRef;
    protected readonly document = inject<Document>(DOCUMENT);

    constructor(
        private overlay: Overlay,
        private vcr: ViewContainerRef
    ) {
        fromEvent(this.document, 'dragleave').subscribe((event) => {
            event.preventDefault();
            this.close();
        });

        fromEvent(this.document, 'dragenter').subscribe((event) => {
            event.preventDefault();
            this.close();

            this.openGlobal();
        });

        fromEvent(this.document, 'drop').subscribe((event) => {
            event.preventDefault();
            this.close();
        });
    }

    openGlobal() {
        this.overlayRef = this.overlay.create({
            hasBackdrop: true,
            backdropClass: 'kbq-dropzone',
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
        });

        this.overlayRef.attach(new TemplatePortal(this.overlayTpl, this.vcr));

        this.overlayRef.backdropClick().subscribe(() => this.close());
    }

    close() {
        this.overlayRef?.dispose();
    }
}
