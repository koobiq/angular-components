import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    forwardRef,
    Input,
    QueryList,
    Renderer2,
    SkipSelf,
    ViewEncapsulation
} from '@angular/core';
import { getNodesWithoutComments } from '@koobiq/components/core';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';

export enum KbqBadgeColors {
    FadeContrast = 'fade-contrast',
    FadeTheme = 'fade-theme',
    FadeSuccess = 'fade-success',
    FadeWarning = 'fade-warning',
    FadeError = 'fade-error',

    Contrast = 'contrast',
    Theme = 'theme',
    Success = 'success',
    Warning = 'warning',
    Error = 'error'
}

@Directive({
    selector: '[kbq-badge-caption]',
    host: {
        class: 'kbq-badge-caption'
    }
})
export class KbqBadgeCaption {}

export const leftIconClassName = 'kbq-icon_left';
export const rightIconClassName = 'kbq-icon_right';

export const badgeLeftIconClassName = 'kbq-badge-icon_left';
export const badgeRightIconClassName = 'kbq-badge-icon_right';

@Directive({
    selector: 'kbq-badge'
})
export class KbqBadgeCssStyler implements AfterContentInit {
    @ContentChildren(forwardRef(() => KbqIcon)) icons: QueryList<KbqIcon>;

    nativeElement: HTMLElement;

    isIconButton: boolean = false;

    constructor(
        elementRef: ElementRef,
        private renderer: Renderer2,
        @SkipSelf() private cdr: ChangeDetectorRef
    ) {
        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this.updateClassModifierForIcons();
    }

    updateClassModifierForIcons() {
        this.renderer.removeClass(this.nativeElement, badgeLeftIconClassName);
        this.renderer.removeClass(this.nativeElement, badgeRightIconClassName);

        const twoIcons = 2;
        const filteredNodesWithoutComments = getNodesWithoutComments(this.nativeElement.childNodes as NodeList);

        const currentIsIconButtonValue =
            !!this.icons.length &&
            this.icons.length === filteredNodesWithoutComments.length &&
            this.icons.length <= twoIcons;

        if (currentIsIconButtonValue !== this.isIconButton) {
            this.isIconButton = currentIsIconButtonValue;
            this.cdr.detectChanges();
        }

        if (this.icons.length && filteredNodesWithoutComments.length > 1) {
            this.icons
                .map((item) => item.getHostElement())
                .forEach((iconHostElement) => {
                    this.renderer.removeClass(iconHostElement, leftIconClassName);
                    this.renderer.removeClass(iconHostElement, rightIconClassName);

                    const iconIndex = filteredNodesWithoutComments.findIndex((node) => node === iconHostElement);

                    if (iconIndex === 0) {
                        this.renderer.addClass(iconHostElement, leftIconClassName);
                        this.renderer.addClass(this.nativeElement, badgeLeftIconClassName);
                    }

                    if (iconIndex === filteredNodesWithoutComments.length - 1) {
                        this.renderer.addClass(iconHostElement, rightIconClassName);
                        this.renderer.addClass(this.nativeElement, badgeRightIconClassName);
                    }
                });
        }
    }
}

@Component({
    selector: 'kbq-badge',
    template: '<ng-content />',
    styleUrls: ['badge.component.scss', 'badge-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-badge',
        '[class.kbq-badge_compact]': 'compact',
        '[class.kbq-badge-filled]': '!outline',
        '[class.kbq-badge-outline]': 'outline',
        '[class]': 'badgeColor'
    }
})
export class KbqBadge {
    @ContentChild(KbqIconItem) iconItem: KbqIconItem;

    @Input() compact: boolean = false;
    @Input() outline: boolean = false;

    @Input()
    get badgeColor(): string {
        return `kbq-badge_${this._badgeColor}`;
    }

    set badgeColor(value: string | KbqBadgeColors) {
        this._badgeColor = value || KbqBadgeColors.FadeContrast;
    }

    private _badgeColor: string | KbqBadgeColors = KbqBadgeColors.FadeContrast;
}
