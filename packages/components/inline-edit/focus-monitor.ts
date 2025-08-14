import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterContentInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';

/** @docs-private */
@Directive({
    standalone: true,
    selector: '[kbqFocusMonitor]'
})
export class KbqFocusMonitor implements AfterContentInit, OnDestroy {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private focusMonitor = inject(FocusMonitor);

    ngAfterContentInit() {
        this.focusMonitor.monitor(this.elementRef, false);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }
}
