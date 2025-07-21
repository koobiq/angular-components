import { CdkScrollable } from '@angular/cdk/scrolling';
import {
    AfterContentInit,
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    DestroyRef,
    Directive,
    ElementRef,
    HostBinding,
    inject,
    input,
    Input,
    OnDestroy,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KBQ_SIDEPANEL_DATA } from '@koobiq/components/sidepanel';
import { KbqIconModule } from '../icon';
import { KbqResizable, KbqResizeModule } from './resize';

export enum KbqContentPanelSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large'
}

@Directive({
    standalone: true,
    selector: '[kbqContentPanelAside]',
    exportAs: 'kbqContentPanelAside',
    host: {
        class: 'kbq-content-panel-aside'
    }
})
export class KbqContentPanelAside {}

@Directive({
    standalone: true,
    selector: '[kbqContentPanelHeaderTitle]',
    exportAs: 'kbqContentPanelHeaderTitle',
    host: {
        class: 'kbq-content-panel-header-title'
    }
})
export class KbqContentPanelHeaderTitle {}

@Directive({
    standalone: true,
    selector: '[kbqContentPanelHeaderActions]',
    exportAs: 'kbqContentPanelHeaderActions',
    host: {
        class: 'kbq-content-panel-header-actions'
    }
})
export class KbqContentPanelHeaderActions {}

@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqIconModule],
    selector: 'kbq-content-panel-header',
    host: {
        class: 'kbq-content-panel-header'
    },
    template: `
        <div class="kbq-content-panel-header__wrapper">
            <ng-content select="[kbqContentPanelHeaderTitle]" />
            <div class="kbq-content-panel-header__actions">
                <ng-content select="[kbqContentPanelHeaderActions]" />
                @if (hasCloseButton()) {
                    <button
                        class="kbq-content-panel-header__close-button"
                        [color]="componentColors.Contrast"
                        [kbqStyle]="buttonStyles.Transparent"
                        kbq-button
                        type="button"
                    >
                        <i kbq-icon="kbq-xmark_16"></i>
                    </button>
                }
            </div>
        </div>
        <ng-content />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            padding: var(--kbq-size-l) var(--kbq-size-xxl);
        }

        .kbq-content-panel-header__wrapper,
        .kbq-content-panel-header__actions {
            display: flex;
            align-items: center;
        }

        .kbq-content-panel-header__actions {
            overflow: hidden;
            justify-content: flex-end;
        }

        .kbq-content-panel-header__close-button {
            margin-left: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqContentPanelHeader {
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly componentColors = KbqComponentColors;

    readonly hasCloseButton = input(true, { transform: booleanAttribute });
}

@Directive({
    standalone: true,
    selector: '[kbqContentPanelBody]',
    exportAs: 'kbqContentPanelBody',
    host: {
        class: 'kbq-content-panel-body kbq-scrollbar'
    },
    hostDirectives: [CdkScrollable]
})
export class KbqContentPanelBody {}

@Component({
    standalone: true,
    selector: 'kbq-content-panel-footer',
    template: `
        <div class="ic-content-panel__footer">
            <ng-content />
        </div>
    `,
    host: {
        class: 'kbq-content-panel-footer'
    },
    styles: `
        :host {
            &.ic-sidepanel__footer_shadow {
                position: relative;
                z-index: 2;
                box-shadow: var(--kbq-shadow-overflow-normal-top);
            }
        }

        .ic-content-panel__footer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: var(--kbq-size-xl) var(--kbq-size-xxl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqContentPanelFooter {
    @HostBinding('class.ic-sidepanel__footer_shadow')
    isShadowRequired = false;
}

@Component({
    standalone: true,
    selector: 'kbq-content-panel',
    imports: [KbqResizeModule],
    hostDirectives: [KbqResizable],
    template: `
        <div class="kbq-content-panel__resizer" [kbqResizer]="[-1, 0]"></div>
        <ng-content select="[kbqContentPanelAside]" />
        <div class="kbq-content-panel__content">
            <ng-content select="kbq-content-panel-header" />
            <ng-content select="[kbqContentPanelBody]" />
            <ng-content select="kbq-content-panel-footer" />
        </div>
    `,
    styleUrls: ['./content-panel.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-content-panel'
    }
})
export class KbqContentPanel implements AfterContentInit, AfterViewInit, OnDestroy {
    private readonly scrollableContentBody = contentChild(KbqContentPanelBody, { read: CdkScrollable });
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    // readonly #window = inject(KBQ_WINDOW);
    readonly #el: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

    @Input()
    data: { ghostElement?: HTMLElement } = inject(KBQ_SIDEPANEL_DATA, { optional: true });

    #size = KbqContentPanelSize.Medium;
    #initialWidth: number | null = null;

    @Input()
    set size(value: KbqContentPanelSize) {
        this.#size = value;
    }

    @HostBinding('class')
    get hostClass(): string {
        return `ic-content-panel_${this.#size}`;
    }

    @HostBinding('style.width.px')
    protected width: number | null = null;

    // @HostListener('widthChange', ['$event'])
    // onWidthChange(newWidth: number): void {
    //     this.width = newWidth;

    //     if (this.data.ghostElement) {
    //         let contentPanelGhostOffset = 0;

    //         if (this.data.ghostElement.parentElement) {
    //             contentPanelGhostOffset =
    //                 this.#window.innerWidth - this.data.ghostElement.parentElement.getBoundingClientRect().right;
    //         }

    //         this.data.ghostElement.style.setProperty(
    //             '--content-panel-width',
    //             `${newWidth + 8 - contentPanelGhostOffset}px`
    //         );
    //     }
    // }

    get initialWidth(): number {
        return this.#initialWidth || 0;
    }

    constructor() {
        afterNextRender(() => {
            this.handleContentBodyScroll();
        });
    }

    ngAfterContentInit(): void {
        if (this.data.ghostElement) {
            this.data.ghostElement.style.width = `var(--content-panel-width)`;
        }
    }

    ngAfterViewInit(): void {
        this.#initialWidth = this.#el.nativeElement.offsetWidth;
    }

    ngOnDestroy(): void {
        if (this.data.ghostElement) {
            this.data.ghostElement.style.width = '';
        }
    }

    private handleContentBodyScroll(): void {
        const scrollableCodeContent = this.scrollableContentBody();

        if (!scrollableCodeContent) return;

        scrollableCodeContent
            .elementScrolled()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.setupContentHeaderShadow(scrollableCodeContent.measureScrollOffset('top') > 0);
                this.setupContentFooterShadow(scrollableCodeContent.measureScrollOffset('bottom') > 0);
            });
    }

    private setupContentHeaderShadow(shouldShowShadow: boolean): void {
        const className = 'kbq-content-panel_header-with-shadow';

        if (shouldShowShadow) {
            this.renderer.addClass(this.elementRef.nativeElement, className);
        } else {
            this.renderer.removeClass(this.elementRef.nativeElement, className);
        }
    }

    private setupContentFooterShadow(shouldShowShadow: boolean): void {
        const className = 'kbq-content-panel_footer-with-shadow';

        if (shouldShowShadow) {
            this.renderer.addClass(this.elementRef.nativeElement, className);
        } else {
            this.renderer.removeClass(this.elementRef.nativeElement, className);
        }
    }
}
