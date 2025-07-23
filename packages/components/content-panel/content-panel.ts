import { CdkScrollable } from '@angular/cdk/scrolling';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
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
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
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
    standalone: true,
    selector: '[kbqContentPanelFooter]',
    host: {
        class: 'kbq-content-panel-footer'
    }
})
export class KbqContentPanelFooter {}

@Component({
    standalone: true,
    selector: 'kbq-content-panel',
    host: {
        class: 'kbq-content-panel'
    },
    template: `
        <ng-content select="[kbqContentPanelAside]" />
        <div class="kbq-content-panel__content">
            <ng-content select="kbq-content-panel-header" />
            <ng-content select="[kbqContentPanelBody]" />
            <ng-content select="[kbqContentPanelFooter]" />
        </div>
    `,
    styleUrls: ['./content-panel.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqContentPanel {
    private readonly scrollableContentBody = contentChild(KbqContentPanelBody, { read: CdkScrollable });
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        afterNextRender(() => this.handleContentBodyScroll());
    }

    private handleContentBodyScroll(): void {
        const scrollableCodeContent = this.scrollableContentBody();

        console.log('handleContentBodyScroll', scrollableCodeContent);

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
    imports: [],
    selector: 'kbq-content-panel-container',
    exportAs: 'kbqContentPanelContainer',
    host: {
        class: 'kbq-content-panel-container',
        '[class.kbq-content-panel-container__opened]': 'openedState()'
    },
    template: `
        <div class="kbq-content-panel-container__content">
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
    readonly opened = input(false, { transform: booleanAttribute });

    readonly disableClose = input(false, { transform: booleanAttribute });

    readonly openedChange = output<boolean>();

    // 480
    readonly minWidth = input(400, { transform: numberAttribute });
    // 640
    readonly width = input(500, { transform: numberAttribute });
    // 800
    readonly maxWidth = input(600, { transform: numberAttribute });

    /**
     * @docs-private
     */
    protected readonly openedState = signal(this.opened());

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
