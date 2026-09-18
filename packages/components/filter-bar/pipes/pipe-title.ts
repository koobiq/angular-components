import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { AfterViewInit, contentChildren, Directive, effect, ElementRef, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, merge, throttleTime } from 'rxjs';

/**
 * Shows the full pipe value only when its name or value is truncated by the pipe layout.
 *
 * Unlike `KbqTitleDirective`, this directive deliberately measures the Filter Bar's own text tracks. A pipe can
 * split its available width between two tracks, so either track may be clipped while still being narrower than
 * the complete trigger.
 */
@Directive({
    selector: '[kbqPipeTitle]',
    host: {
        '(focusin)': 'updateDisabled()',
        '(mouseenter)': 'updateDisabled()'
    },
    hostDirectives: [
        {
            directive: KbqTooltipTrigger,
            inputs: [
                'kbqTooltip: kbqPipeTitle',
                'ignoreTooltipPointerEvents',
                'kbqPlacement',
                'kbqPlacementPriority',
                'kbqEnterDelay',
                'kbqLeaveDelay'
            ]
        }
    ]
})
export class KbqPipeTitle implements AfterViewInit {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly tooltip = inject(KbqTooltipTrigger, { self: true });
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);

    private readonly textElements: Signal<readonly ElementRef<HTMLElement>[]> = contentChildren('kbqTitleText', {
        descendants: true,
        read: ElementRef
    });

    constructor() {
        this.tooltip.disabled = true;

        effect((onCleanup) => {
            const targets = [
                this.elementRef.nativeElement,
                ...this.textElements().map(({ nativeElement }) => nativeElement)
            ];
            const subscription = merge(...targets.map((target) => this.resizeObserver.observe(target)))
                .pipe(debounceTime(100))
                .subscribe(this.updateDisabled);

            onCleanup(() => subscription.unsubscribe());
        });

        this.contentObserver
            .observe(this.elementRef.nativeElement)
            .pipe(throttleTime(100), takeUntilDestroyed())
            .subscribe(this.updateDisabled);
    }

    ngAfterViewInit(): void {
        this.updateDisabled();
    }

    /** Re-evaluates whether the tooltip has clipped pipe text to explain. */
    protected readonly updateDisabled = () => {
        this.tooltip.disabled = !this.textElements().some(({ nativeElement }) => {
            return nativeElement.clientWidth > 0 && nativeElement.clientWidth < nativeElement.scrollWidth;
        });
    };
}
