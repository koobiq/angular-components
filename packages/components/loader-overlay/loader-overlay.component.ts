import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { KbqDefaultSizes } from '@koobiq/components/core';

const kbqLoaderOverlayParent = 'kbq-loader-overlay_parent';

@Directive({
    selector: '[kbq-loader-overlay-indicator]',
    host: {
        class: 'kbq-loader-overlay-indicator'
    }
})
export class KbqLoaderOverlayIndicator {}

@Directive({
    selector: '[kbq-loader-overlay-text]',
    host: {
        class: 'kbq-loader-overlay-text'
    }
})
export class KbqLoaderOverlayText {}

@Directive({
    selector: '[kbq-loader-overlay-caption]',
    host: {
        class: 'kbq-loader-overlay-caption'
    }
})
export class KbqLoaderOverlayCaption {}

@Component({
    selector: 'kbq-loader-overlay',
    templateUrl: './loader-overlay.component.html',
    styleUrls: ['./loader-overlay.scss', 'loader-overlay-tokens.scss'],
    host: {
        class: 'kbq-loader-overlay',
        '[class.kbq-loader-overlay_empty]': 'isEmpty',
        '[class.kbq-loader-overlay_transparent]': 'transparent',
        '[class.kbq-loader-overlay_filled]': '!transparent',
        '[class.kbq-loader-overlay_big]': 'size === "big"',
        '[class.kbq-loader-overlay_normal]': 'size === "normal"',
        '[class.kbq-loader-overlay_compact]': 'size === "compact"'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqLoaderOverlay implements OnInit, OnDestroy {
    @Input() text: string;

    @Input() caption: string;
    @Input() size: KbqDefaultSizes = 'big';
    @Input() transparent: boolean = true;

    private parent: HTMLElement | null = null;

    get isExternalIndicator(): boolean {
        return !!this.externalIndicator;
    }

    get isExternalText(): boolean {
        return !!this.externalText;
    }

    get isExternalCaption(): boolean {
        return !!this.externalCaption;
    }

    get isEmpty(): boolean {
        return !(!!this.text || this.isExternalText || !!this.caption || this.isExternalCaption);
    }

    get spinnerSize(): string {
        return this.size === 'compact' ? 'compact' : 'big';
    }

    @ContentChild(KbqLoaderOverlayIndicator) externalIndicator: KbqLoaderOverlayIndicator | null;
    @ContentChild(KbqLoaderOverlayText) externalText: KbqLoaderOverlayText | null;
    @ContentChild(KbqLoaderOverlayCaption) externalCaption: KbqLoaderOverlayCaption | null;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {}

    ngOnInit(): void {
        this.parent = this.elementRef.nativeElement.parentElement;

        this.renderer.addClass(this.parent, kbqLoaderOverlayParent);
    }

    ngOnDestroy(): void {
        this.renderer.removeClass(this.parent, kbqLoaderOverlayParent);
    }
}
