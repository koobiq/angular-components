import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import {
    Component,
    Directive,
    OnDestroy,
    ViewEncapsulation,
    afterRenderEffect,
    booleanAttribute,
    inject,
    input
} from '@angular/core';
import { KBQ_WINDOW, kbqInjectNativeElement } from '@koobiq/components/core';

/** Timestamp of the first skeleton instance — used as animation start time for sync */
let animationStartTime: number | null = null;
/** Count of active skeleton instances */
let count = 0;

/**
 * Component used to load the `.kbq-skeleton` styles.
 */
@Component({
    selector: 'skeleton-style-loader',
    template: '',
    styleUrl: 'skeleton.scss',
    encapsulation: ViewEncapsulation.None
})
class SkeletonStyleLoader {}

/**
 * Directive representing a skeleton placeholder.
 */
@Directive({
    selector: 'kbq-skeleton, [kbqSkeleton]',
    host: {
        class: 'kbq-skeleton',
        '[class.kbq-skeleton_disabled]': '!enabled()'
    },
    exportAs: 'kbqSkeleton'
})
export class KbqSkeleton implements OnDestroy {
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);
    private readonly element = kbqInjectNativeElement();
    private readonly window = inject(KBQ_WINDOW);

    /** Whether the skeleton is enabled. */
    readonly enabled = input(true, { transform: booleanAttribute, alias: 'kbqSkeleton' });

    constructor() {
        count++;

        this.styleLoader.load(SkeletonStyleLoader);

        afterRenderEffect(() => {
            if (!this.enabled()) return;

            const enabledAt = Date.now();

            animationStartTime ??= enabledAt;

            this.syncAnimation(enabledAt);
        });
    }

    ngOnDestroy(): void {
        if (--count === 0) {
            animationStartTime = null;
        }
    }

    private syncAnimation(enabledAt: number): void {
        const elapsed = enabledAt - (animationStartTime ?? 0);
        const durationMs = parseFloat(
            this.window.getComputedStyle(this.element).getPropertyValue('--kbq-skeleton-animation-duration')
        );
        const delay = -(elapsed % durationMs);

        this.element.style.setProperty('--kbq-skeleton-animation-delay', `${delay}ms`);
    }
}
