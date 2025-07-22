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
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { startWith } from 'rxjs';
import { KbqResizable, KbqResizer } from './resizable';

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

        .kbq-content-panel-header__wrapper {
            display: flex;
            justify-content: space-between;
        }

        .kbq-content-panel-header__actions {
            display: flex;
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
    imports: [KbqResizer],
    hostDirectives: [KbqResizable],
    host: {
        class: 'kbq-content-panel'
    },
    template: `
        <div class="kbq-content-panel__resizer" [kbqResizer]="[-1, 0]"></div>
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
        afterNextRender(() => {
            this.handleContentBodyScroll();
        });
    }

    private handleContentBodyScroll(): void {
        const scrollableCodeContent = this.scrollableContentBody();

        if (!scrollableCodeContent) return;

        scrollableCodeContent
            .elementScrolled()
            .pipe(startWith(undefined), takeUntilDestroyed(this.destroyRef))
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
