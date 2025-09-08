import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterContentInit, booleanAttribute, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';

/** Directive that wraps cdk `FocusMonitor` into standalone directive */
@Directive({
    standalone: true,
    selector: '[kbqFocusMonitor]',
    exportAs: 'kbqFocusMonitor'
})
export class KbqFocusMonitor implements AfterContentInit, OnDestroy {
    readonly checkChildren = input(false, { transform: booleanAttribute });
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private focusMonitor = inject(FocusMonitor);

    ngAfterContentInit() {
        this.focusMonitor.monitor(this.elementRef, this.checkChildren());
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }
}
