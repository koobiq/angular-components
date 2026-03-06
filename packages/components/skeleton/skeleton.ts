import { ChangeDetectionStrategy, Component, ViewEncapsulation, afterNextRender, inject } from '@angular/core';
import { KBQ_WINDOW, kbqInjectNativeElement } from '@koobiq/components/core';

/** Timestamp of the first skeleton instance — used as animation start time for sync */
let animationStartTime: number | null = null;

/**
 * Component representing a skeleton placeholder.
 */
@Component({
    selector: 'kbq-skeleton',
    template: '',
    styleUrl: 'skeleton.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-skeleton'
    },
    exportAs: 'kbqSkeleton'
})
export class KbqSkeleton {
    private readonly element = kbqInjectNativeElement();
    private readonly window = inject(KBQ_WINDOW);
    private readonly createdAt = this.window.performance.now();

    constructor() {
        if (animationStartTime === null) animationStartTime = this.createdAt;

        afterNextRender(() => this.syncAnimation());
    }

    private syncAnimation(): void {
        const elapsed = this.createdAt - (animationStartTime ?? 0);
        const durationMs = parseFloat(
            this.window.getComputedStyle(this.element).getPropertyValue('--kbq-skeleton-animation-duration')
        );
        const delay = -(elapsed % durationMs);

        this.element.style.setProperty('--kbq-skeleton-animation-delay', `${delay}ms`);
    }
}
