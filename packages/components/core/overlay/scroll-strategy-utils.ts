import { OverlayRef } from '@angular/cdk/overlay';
import { ScrollDispatcherTarget } from '@angular/cdk/scrolling';

/** @docs-private */
export function isScrollFromInsideOverlay(overlayRef: OverlayRef, scrollable: ScrollDispatcherTarget | void): boolean {
    return !!scrollable && overlayRef.overlayElement.contains(scrollable.getElementRef().nativeElement);
}
