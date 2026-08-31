import { CdkScrollable, OverlayRef } from '@angular/cdk/overlay';

/** @docs-private */
export function isScrollFromInsideOverlay(overlayRef: OverlayRef, scrollable: CdkScrollable | void): boolean {
    return !!scrollable && overlayRef.overlayElement.contains(scrollable.getElementRef().nativeElement);
}
