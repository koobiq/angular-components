import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { AfterContentInit, booleanAttribute, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

/** Directive that wraps cdk `FocusMonitor` into standalone directive */
@Directive({
    standalone: true,
    selector: '[kbqFocusMonitor]',
    exportAs: 'kbqFocusMonitor'
})
export class KbqFocusMonitor implements AfterContentInit, OnDestroy {
    /** Whether to monitor focus changes on child elements. */
    readonly checkChildren = input(false, { transform: booleanAttribute });
    /** Observable that emits focus origin when element or its children gains/loses focus. */
    focusChange: Observable<FocusOrigin> | null = null;

    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private focusMonitor = inject(FocusMonitor);

    ngAfterContentInit(): void {
        this.focusChange = this.focusMonitor.monitor(this.elementRef, this.checkChildren());
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.focusChange = null;
    }

    /** Programmatically focuses an element with the specified origin. */
    focusVia(element: HTMLElement | ElementRef<HTMLElement>, origin: FocusOrigin, options?: FocusOptions): void {
        this.focusMonitor.focusVia(coerceElement(element), origin, options);
    }
}
