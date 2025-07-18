import { CdkScrollable } from '@angular/cdk/scrolling';
import {
    AfterContentInit,
    afterNextRender,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    inject,
    Input,
    NgZone,
    OnDestroy,
    Output,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, KbqComponentColors } from '@koobiq/components/core';
import { KBQ_SIDEPANEL_DATA } from '@koobiq/components/sidepanel';
import { distinctUntilChanged, filter, fromEvent, map, switchMap, takeUntil } from 'rxjs';
import { KbqButtonModule, KbqButtonStyles } from '../button';
import { KbqResizable, KbqResizer } from './resize';

export enum KbqContentPanelSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large'
}

@Directive({
    standalone: true,
    selector: '[kbqContentPanelToolbar]',
    exportAs: 'kbqContentPanelToolbar',
    host: {
        class: 'kbq-content-panel-toolbar'
    }
})
export class KbqContentPanelToolbar {}

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

@Directive({
    selector: '[icResizableContentPanel]',
    standalone: true
})
export class ResizableContentPanelDirective implements AfterViewInit, OnDestroy {
    @Input() minWidth = 480;
    @Input() maxWidth = 800;

    @Output() widthChange = new EventEmitter<number>();

    readonly #el: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #ngZone: NgZone = inject(NgZone);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #icContentPanelComponent = inject(KbqContentPanel);

    private get initialPanelWidth(): number {
        return this.#icContentPanelComponent.initialWidth || this.minWidth;
    }

    ngAfterViewInit(): void {
        this.widthChange.emit(this.#el.nativeElement.offsetWidth);
        this.#ngZone.runOutsideAngular(() => {
            fromEvent<MouseEvent>(this.#el.nativeElement, 'mousedown')
                .pipe(
                    filter((event) => (event.target as HTMLElement).classList.contains('ic-content-panel__resizer')),
                    switchMap((event: MouseEvent) => {
                        event.preventDefault();

                        const startX: number = event.clientX;
                        const startWidth: number = this.#el.nativeElement.offsetWidth;

                        const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
                        const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');

                        return mousemove$.pipe(
                            map((moveEvent) => {
                                const dx = moveEvent.clientX - startX;
                                let newWidth = startWidth - dx;

                                newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));

                                return newWidth;
                            }),
                            distinctUntilChanged(),
                            takeUntil(mouseup$)
                        );
                    }),
                    takeUntilDestroyed(this.#destroyRef)
                )
                .subscribe((newWidth) => {
                    this.#ngZone.run(() => {
                        this.widthChange.emit(newWidth);
                    });
                });

            fromEvent<MouseEvent>(this.#el.nativeElement, 'dblclick')
                .pipe(
                    filter(
                        (event) =>
                            (event.target as HTMLElement).classList.contains('ic-content-panel__resizer') &&
                            this.#el.nativeElement.offsetWidth !== this.initialPanelWidth
                    ),
                    takeUntilDestroyed(this.#destroyRef)
                )
                .subscribe(() => {
                    this.#ngZone.run(() => {
                        this.widthChange.emit(this.initialPanelWidth);
                    });
                });
        });
    }

    ngOnDestroy(): void {
        this.widthChange.emit(0);
    }
}

@Directive({
    standalone: true,
    selector: '[icContentPanelTitle], ic-content-panel-title, [ic-content-panel-title]'
    // host: {
    //     class: 'kbq-title'
    // }
})
export class KbqContentPanelTitle {}

@Component({
    standalone: true,
    imports: [KbqButtonModule],
    selector: 'kbq-content-panel-header',
    host: {
        class: 'kbq-content-panel-header'
    },
    template: `
        <div class="ic-content-panel__header">
            <ng-content />
            @if (hasCloseButton) {
                <button
                    [color]="componentColors.Contrast"
                    [kbqStyle]="buttonStyles.Transparent"
                    kbq-button
                    kbqSidepanelClose
                    type="button"
                >
                    <i kbq-icon="kbq-xmark_16"></i>
                </button>
            }
        </div>
    `,
    styles: `
        :host {
            &.ic-sidepanel__header_shadow {
                position: relative;
                z-index: 2;
                box-shadow: var(--kbq-shadow-overflow-normal-bottom);
            }
        }

        .ic-content-panel__header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: var(--kbq-size-l) var(--kbq-size-l) var(--kbq-size-l) var(--kbq-size-xxl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqContentPanelHeader {
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly componentColors = KbqComponentColors;

    @HostBinding('class.ic-sidepanel__header_shadow')
    isShadowRequired = false;

    @Input()
    hasCloseButton = false;
}

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
    imports: [KbqResizer],
    template: `
        <div [kbqResizer]="[-1, 0]">res</div>
        <ng-content select="[kbqContentPanelToolbar]" />
        <div class="kbq-content-panel__content">
            <ng-content select="kbq-content-panel-header" />
            <ng-content select="[kbqContentPanelBody]" />
            <ng-content select="kbq-content-panel-footer" />
        </div>
        <!-- <div class="ic-content-panel__resizer"></div> -->
    `,
    styleUrls: ['./content-panel.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-content-panel'
    },
    hostDirectives: [
        // {
        //     directive: ResizableContentPanelDirective,
        //     outputs: ['widthChange']
        // }
        KbqResizable
    ]
})
export class KbqContentPanel implements AfterContentInit, AfterViewInit, OnDestroy {
    private readonly scrollableContentBody = contentChild(KbqContentPanelBody, { read: CdkScrollable });
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly #window = inject(KBQ_WINDOW);
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

    @HostListener('widthChange', ['$event'])
    onWidthChange(newWidth: number): void {
        this.width = newWidth;

        if (this.data.ghostElement) {
            let contentPanelGhostOffset = 0;

            if (this.data.ghostElement.parentElement) {
                contentPanelGhostOffset =
                    this.#window.innerWidth - this.data.ghostElement.parentElement.getBoundingClientRect().right;
            }

            this.data.ghostElement.style.setProperty(
                '--content-panel-width',
                `${newWidth + 8 - contentPanelGhostOffset}px`
            );
        }
    }

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
