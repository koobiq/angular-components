import { CdkOverlayOrigin, type FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import type { ElementRef } from '@angular/core';
import type { KbqCaretRect } from '../form-field/caret-rect';

/**
 * Anything a connected overlay can be anchored to: an element, or a rectangle in viewport coordinates such as
 * the caret rectangle {@link kbqGetCaretRect} measures.
 */
export type KbqOverlayOrigin = ElementRef<HTMLElement> | HTMLElement | CdkOverlayOrigin | KbqCaretRect;

/** Whether the origin is an element with a box of its own, rather than a rectangle in viewport coordinates. */
export const kbqIsElementOrigin = (origin: KbqOverlayOrigin): boolean =>
    origin instanceof CdkOverlayOrigin ||
    !!(origin as ElementRef<HTMLElement>).nativeElement ||
    'getBoundingClientRect' in origin;

/** Resolves a Koobiq origin into the value a connected position strategy accepts. */
export const kbqResolveOverlayOrigin = (
    origin: KbqOverlayOrigin | FlexibleConnectedPositionStrategyOrigin
): FlexibleConnectedPositionStrategyOrigin => (origin instanceof CdkOverlayOrigin ? origin.elementRef : origin);

/** Rectangle of an overlay origin in viewport coordinates, for measurements and arrow alignment. */
export const kbqGetOverlayOriginSize = (
    origin: KbqOverlayOrigin | FlexibleConnectedPositionStrategyOrigin
): Pick<KbqCaretRect, 'x' | 'y' | 'width' | 'height'> => {
    const resolved = kbqResolveOverlayOrigin(origin);
    const element = (resolved as ElementRef<HTMLElement>).nativeElement ?? (resolved as HTMLElement | KbqCaretRect);

    // Duck typing rather than `instanceof Element`, which is not defined on the server.
    if ('getBoundingClientRect' in element) {
        const { left, top, width, height } = element.getBoundingClientRect();

        return { x: left, y: top, width, height };
    }

    const { x, y, width = 0, height = 0 } = element;

    return { x, y, width, height };
};
