import { CdkObserveContent } from '@angular/cdk/observers';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    contentChild,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    Input,
    input,
    Renderer2,
    untracked,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
    Error = 'error',
    Disabled = 'disabled'
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
    selector: 'kbq-badge',
    hostDirectives: [CdkObserveContent]
})
export class KbqBadgeCssStyler {
    private renderer = inject(Renderer2);
    private cdr = inject(ChangeDetectorRef, { skipSelf: true });
    private observeContent = inject(CdkObserveContent);

    readonly icons = contentChildren(forwardRef(() => KbqIcon));

    nativeElement: HTMLElement;

    isIconButton: boolean = false;

    constructor() {
        const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

        this.nativeElement = elementRef.nativeElement;

        // Icon placement depends on sibling text nodes that are invisible to the `icons` query,
        // so a real content mutation observer drives most updates. The effect below only covers
        // icon creation/removal (e.g. via `@if`) for the moment the observer is disabled because
        // there were no icons to watch yet.
        this.observeContent.event.pipe(takeUntilDestroyed()).subscribe(() => this.updateClassModifierForIcons());

        effect(() => {
            this.observeContent.disabled = !this.icons().length;

            untracked(() => this.updateClassModifierForIcons());
        });
    }

    updateClassModifierForIcons() {
        this.renderer.removeClass(this.nativeElement, badgeLeftIconClassName);
        this.renderer.removeClass(this.nativeElement, badgeRightIconClassName);

        const twoIcons = 2;
        const filteredNodesWithoutComments = getNodesWithoutComments(this.nativeElement.childNodes as NodeList);

        const icons = this.icons();
        const currentIsIconButtonValue =
            !!icons.length && icons.length === filteredNodesWithoutComments.length && icons.length <= twoIcons;

        if (currentIsIconButtonValue !== this.isIconButton) {
            this.isIconButton = currentIsIconButtonValue;
            this.cdr.detectChanges();
        }

        const iconsValue = this.icons();

        if (iconsValue.length && filteredNodesWithoutComments.length > 1) {
            iconsValue
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
        '[class.kbq-badge_compact]': 'compact()',
        '[class.kbq-badge-filled]': '!outline()',
        '[class.kbq-badge-outline]': 'outline()',
        '[class]': 'badgeColor'
    }
})
export class KbqBadge {
    readonly iconItem = contentChild(KbqIconItem);

    readonly compact = input<boolean>(false);
    readonly outline = input<boolean>(false);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get badgeColor(): string {
        return `kbq-badge_${this._badgeColor}`;
    }

    set badgeColor(value: string | KbqBadgeColors) {
        this._badgeColor = value || KbqBadgeColors.FadeContrast;
    }

    private _badgeColor: string | KbqBadgeColors = KbqBadgeColors.FadeContrast;
}
