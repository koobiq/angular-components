import { CdkOverlayOrigin, FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';
import { KbqCaretRect } from '../form-field/caret-rect';

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
export const kbqResolveOverlayOrigin = (origin: KbqOverlayOrigin): FlexibleConnectedPositionStrategyOrigin =>
    origin instanceof CdkOverlayOrigin ? origin.elementRef : origin;

/** Size of an overlay origin, for the offsets that keep an arrow pointing at an anchor narrower than itself. */
export const kbqGetOverlayOriginSize = (origin: KbqOverlayOrigin): Pick<KbqCaretRect, 'width' | 'height'> => {
    const resolved = kbqResolveOverlayOrigin(origin);
    const element = (resolved as ElementRef<HTMLElement>).nativeElement ?? (resolved as HTMLElement | KbqCaretRect);

    // Duck typing rather than `instanceof Element`, which is not defined on the server.
    if ('getBoundingClientRect' in element) return element.getBoundingClientRect();

    const { width, height } = element;

    return { width, height };
};
