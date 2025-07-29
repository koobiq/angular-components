import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    output,
    Renderer2,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqAnimationCurves, KbqAnimationDurations, KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarDirective, KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { SizeL } from '@koobiq/design-tokens';
import { KbqResizable, KbqResizer, KbqResizerSizeChangeEvent } from './resizable';

const KBQ_CONTENT_PANEL_CONTAINER_CONTENT_ANIMATION = trigger('contentAnimation', [
    state('false', style({ 'margin-right': 0 })),
    state('true', style({ 'margin-right': '{{ marginRight }}px' }), { params: { marginRight: 0 } }),
    transition('true => false', [
        animate(`${KbqAnimationDurations.Entering} ${KbqAnimationCurves.AccelerationCurve}`)]),
    transition('false => true', [
        animate(`${KbqAnimationDurations.Exiting} ${KbqAnimationCurves.DecelerationCurve}`)])

]);

const KBQ_CONTENT_PANEL_CONTAINER_PANEL_ANIMATION = trigger('panelAnimation', [
    transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate(
            `${KbqAnimationDurations.Entering} ${KbqAnimationCurves.DecelerationCurve}`,
            style({ transform: 'translateX(0%)' })
        )]),
    transition(':leave', [
        animate(
            `${KbqAnimationDurations.Exiting} ${KbqAnimationCurves.AccelerationCurve}`,
            style({ transform: 'translateX(100%)' })
        )])

]);

@Component({
    standalone: true,
    selector: 'kbq-content-panel-aside',
    exportAs: 'kbqContentPanelAside',
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-aside.scss',
    host: {
        class: 'kbq-content-panel-aside'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
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
                @if (!contentPanelContainer.disableClose()) {
                    <button
                        class="kbq-content-panel-header__close-button"
                        [color]="componentColors.Contrast"
                        [kbqStyle]="buttonStyles.Transparent"
                        (click)="contentPanelContainer.close()"
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
    styleUrl: './content-panel-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqContentPanelHeader {
    /**
     * @docs-private
     */
    protected readonly contentPanelContainer = inject(KbqContentPanelContainer);
    /**
     * @docs-private
     */
    protected readonly buttonStyles = KbqButtonStyles;
    /**
     * @docs-private
     */
    protected readonly componentColors = KbqComponentColors;
}

@Component({
    standalone: true,
    hostDirectives: [KbqScrollbarDirective],
    selector: 'kbq-content-panel-body',
    exportAs: 'kbqContentPanelBody',
    host: {
        class: 'kbq-content-panel-body'
    },
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-body.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqContentPanelBody {}

@Component({
    standalone: true,
    selector: 'kbq-content-panel-footer',
    host: {
        class: 'kbq-content-panel-footer'
    },
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-footer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqContentPanelFooter {}

@Component({
    standalone: true,
    selector: 'kbq-content-panel',
    host: {
        class: 'kbq-content-panel'
    },
    template: `
        <ng-content select="kbq-content-panel-aside" />
        <div class="kbq-content-panel__content">
            <ng-content select="kbq-content-panel-header" />
            <ng-content select="kbq-content-panel-body" />
            <ng-content select="kbq-content-panel-footer" />
        </div>
    `,
    styleUrl: './content-panel.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqContentPanel {
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Reference to the `CdkScrollable` instance of the `KbqContentPanelBody`.
     */
    readonly scrollableBody = contentChild(KbqContentPanelBody, { read: CdkScrollable });

    constructor() {
        afterNextRender(() => this.handleContentBodyScroll());
    }

    private handleContentBodyScroll(): void {
        const scrollableCodeContent = this.scrollableBody();

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

@Component({
    standalone: true,
    imports: [KbqResizable, KbqResizer, KbqScrollbarModule],
    selector: 'kbq-content-panel-container',
    exportAs: 'kbqContentPanelContainer',
    host: {
        class: 'kbq-content-panel-container',
        '[class.kbq-content-panel-container__opened]': 'openedState()',
        '(keydown.escape)': 'handleEscapeKeydown($event)'
    },
    template: `
        <div class="kbq-content-panel-container__content" [@contentAnimation]="contentAnimationState()" kbqScrollbar>
            <ng-content />
        </div>
        @if (openedState()) {
            <div
                class="kbq-content-panel-container__panel"
                @panelAnimation
                [style.min-width.px]="minWidth()"
                [style.width.px]="widthState()"
                [style.max-width.px]="maxWidth()"
                kbqResizable
            >
                @if (!disableResizer()) {
                    <div
                        class="kbq-content-panel-container__panel-resizer"
                        [kbqResizer]="[-1, 0]"
                        (sizeChange)="handleResizerSizeChange($event)"
                        (dblclick)="handleResizerDBClick($event)"
                    ></div>
                }
                <ng-content select="kbq-content-panel" />
            </div>
        }
    `,
    styleUrl: './content-panel-container.scss',
    animations: [
        KBQ_CONTENT_PANEL_CONTAINER_CONTENT_ANIMATION,
        KBQ_CONTENT_PANEL_CONTAINER_PANEL_ANIMATION
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqContentPanelContainer {
    /**
     * Reference to the `CdkScrollable` instance of the `KbqContentPanelContainer` content.
     */
    readonly scrollableContent = viewChild.required(CdkScrollable);

    /**
     * Whether the content panel is opened.
     *
     * @default false
     */
    readonly opened = input(false, { transform: booleanAttribute });

    /**
     * Emits event when the content panel opened state is changed.
     */
    readonly openedChange = output<boolean>();

    /**
     * Whether the content panel can not be closed by clicking on the close button or pressing the ESCAPE key.
     *
     * @default false
     */
    readonly disableClose = input(false, { transform: booleanAttribute });

    /**
     * Whether the content panel can not be closed by pressing the ESCAPE key.
     */
    readonly disableCloseByEscape = input(this.disableClose(), { transform: booleanAttribute });

    /**
     * Whether the content panel resizer is disabled.
     */
    readonly disableResizer = input(false, { transform: booleanAttribute });

    /**
     * Minimum width of the `KbqContentPanel`.
     *
     * @default 480
     */
    readonly minWidth = input(480, { transform: numberAttribute });

    /**
     * Width of the `KbqContentPanel`.
     *
     * @default 640
     */
    readonly width = input(640, { transform: numberAttribute });

    /**
     * Max width of the `KbqContentPanel`.
     *
     * @default 800
     */
    readonly maxWidth = input(800, { transform: numberAttribute });

    /**
     * @docs-private
     */
    protected readonly openedState = signal(this.opened());

    /**
     * @docs-private
     */
    protected readonly widthState = signal(this.width());

    /**
     * Whether the content panel is opened.
     */
    readonly isOpened = computed(() => this.openedState());

    /**
     * @docs-private
     */
    protected readonly contentAnimationState = computed(() => {
        return {
            value: this.openedState(),
            params: { marginRight: this.widthState() + (parseInt(SizeL) || 16) }
        };
    });

    constructor() {
        // TODO: Should use linked signal
        toObservable(this.opened)
            .pipe(takeUntilDestroyed())
            .subscribe((opened) => {
                this.openedState.set(opened);
            });

        // TODO: Should use linked signal
        toObservable(this.width)
            .pipe(takeUntilDestroyed())
            .subscribe((width) => {
                this.widthState.set(width);
            });
    }

    /**
     * Toggles the content panel opened state.
     */
    toggle(): void {
        this.openedState.update((state) => !state);
        this.openedChange.emit(this.openedState());
    }

    /**
     * Opens the content panel.
     */
    open(): void {
        if (this.openedState()) return;

        this.openedState.set(true);
        this.openedChange.emit(this.openedState());
    }

    /**
     * Closes the content panel.
     */
    close(): void {
        if (!this.openedState()) return;

        this.openedState.set(false);
        this.openedChange.emit(this.openedState());
    }

    /**
     * @docs-private
     */
    protected handleResizerDBClick(event: MouseEvent): void {
        event.preventDefault();

        this.widthState.set(this.width());
    }

    /**
     * @docs-private
     */
    protected handleResizerSizeChange({ width }: KbqResizerSizeChangeEvent): void {
        if (width > this.maxWidth()) return this.widthState.set(this.maxWidth());
        if (width < this.minWidth()) return this.widthState.set(this.minWidth());

        this.widthState.set(width);
    }

    /**
     * @docs-private
     */
    protected handleEscapeKeydown(event: KeyboardEvent): void {
        if (this.openedState() && (this.disableClose() || this.disableCloseByEscape())) return;

        event.preventDefault();
        this.close();
    }
}
