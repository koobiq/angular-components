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
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

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
                        (document:keydown.escape)="contentPanelContainer.close()"
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
    selector: 'kbq-content-panel-body',
    exportAs: 'kbqContentPanelBody',
    host: {
        class: 'kbq-content-panel-body kbq-scrollbar'
    },
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-body.scss',
    hostDirectives: [CdkScrollable],
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
    imports: [CdkScrollable],
    selector: 'kbq-content-panel-container',
    exportAs: 'kbqContentPanelContainer',
    host: {
        class: 'kbq-content-panel-container',
        '[class.kbq-content-panel-container__opened]': 'openedState()'
    },
    template: `
        <div class="kbq-content-panel-container__content kbq-scrollbar" cdkScrollable>
            <ng-content />
        </div>
        @if (openedState()) {
            <div
                class="kbq-content-panel-container__panel"
                [style.min-width.px]="minWidth()"
                [style.width.px]="width()"
                [style.max-width.px]="maxWidth()"
            >
                <ng-content select="kbq-content-panel" />
            </div>
        }
    `,
    styleUrl: './content-panel-container.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqContentPanelContainer {
    readonly scrollableContent = viewChild.required(CdkScrollable);

    readonly opened = input(false, { transform: booleanAttribute });

    readonly disableClose = input(false, { transform: booleanAttribute });

    readonly openedChange = output<boolean>();

    readonly minWidth = input(480, { transform: numberAttribute });
    readonly width = input(640, { transform: numberAttribute });
    readonly maxWidth = input(800, { transform: numberAttribute });

    readonly isOpened = computed(() => this.openedState());

    /**
     * @docs-private
     */
    protected readonly openedState = signal(this.opened());

    constructor() {
        // TODO: Should use linked signal
        toObservable(this.opened)
            .pipe(takeUntilDestroyed())
            .subscribe((opened) => {
                this.openedState.set(opened);
            });
    }

    toggle(): void {
        this.openedState.update((state) => !state);
        this.openedChange.emit(this.openedState());
    }

    open(): void {
        if (this.openedState()) return;

        this.openedState.set(true);
        this.openedChange.emit(this.openedState());
    }

    close(): void {
        if (!this.openedState()) return;

        this.openedState.set(false);
        this.openedChange.emit(this.openedState());
    }
}
