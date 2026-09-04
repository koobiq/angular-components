import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { getNodesWithoutComments, kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/** Colors supported by the badge. */
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

/** Directive that marks the caption part of a badge. */
@Directive({
    selector: '[kbq-badge-caption]',
    host: {
        class: 'kbq-badge-caption'
    }
})
export class KbqBadgeCaption {}

/** @docs-private */
export const leftIconClassName = 'kbq-icon_left';
/** @docs-private */
export const rightIconClassName = 'kbq-icon_right';

/** @docs-private */
export const badgeLeftIconClassName = 'kbq-badge-icon_left';
/** @docs-private */
export const badgeRightIconClassName = 'kbq-badge-icon_right';

/**
 * Applies the icon spacing modifiers to the badge and to the icons projected into it.
 *
 * @docs-private
 */
@Directive({
    selector: 'kbq-badge'
})
export class KbqBadgeCssStyler {
    private readonly renderer = inject(Renderer2);
    private readonly nativeElement = kbqInjectNativeElement();

    private readonly icons = contentChildren(forwardRef(() => KbqIcon));

    constructor() {
        // Icons projected asynchronously (e.g. behind an `@if`) update the `icons` signal
        // after content init, so class assignment must react to the signal, not just run once.
        effect(() => this.updateClassModifierForIcons());
    }

    private updateClassModifierForIcons(): void {
        this.renderer.removeClass(this.nativeElement, badgeLeftIconClassName);
        this.renderer.removeClass(this.nativeElement, badgeRightIconClassName);

        const filteredNodesWithoutComments = getNodesWithoutComments(this.nativeElement.childNodes as NodeList);
        const icons = this.icons();

        if (icons.length && filteredNodesWithoutComments.length > 1) {
            icons
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

/** Component used to highlight the status, count or another important characteristic of an object. */
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
        '[class]': 'badgeColorClass()'
    }
})
export class KbqBadge {
    /** Whether the badge uses the compact size. */
    readonly compact = input(false, { transform: booleanAttribute });

    /** Whether the badge is outlined instead of filled. */
    readonly outline = input(false, { transform: booleanAttribute });

    /**
     * Color of the badge. An empty, `null` or `undefined` value falls back to the default, so a read of the
     * signal reports the color the badge actually renders in.
     * @default 'fade-contrast'
     */
    readonly badgeColor = input(KbqBadgeColors.FadeContrast as string | KbqBadgeColors, {
        transform: (value: string | KbqBadgeColors | null | undefined): string | KbqBadgeColors =>
            value || KbqBadgeColors.FadeContrast
    });

    /** @docs-private */
    protected readonly badgeColorClass = computed(() => `kbq-badge_${this.badgeColor()}`);
}
