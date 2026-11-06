import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import {
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationSkipped,
    NavigationStart,
    Router
} from '@angular/router';
import { DocsNextLoading } from '../services/loading';

/** How long a wait has to last before the bar shows: a fast load does not flash it. */
const SHOW_DELAY = 150;
/** The bar runs to the end, and then fades. */
const FINISH_DURATION = 150;
const FADE_DURATION = 200;

/**
 * A thin bar at the top edge of the window while a page is on its way: its chunk and its content. The old page stays
 * on the screen until the new one is ready, and the bar is what says that something is happening.
 */
@Component({
    selector: 'docs-next-route-progress',
    template: '',
    styleUrl: './route-progress.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'progressbar',
        'aria-hidden': 'true',
        '[class.docs-next-route-progress_running]': 'state() === "running"',
        '[class.docs-next-route-progress_finishing]': 'state() === "finishing"'
    }
})
export class DocsNextRouteProgress {
    private readonly loading = inject(DocsNextLoading);
    private readonly navigating = signal(false);
    private idleTimer?: ReturnType<typeof setTimeout>;

    protected readonly state = signal<'idle' | 'running' | 'finishing'>('idle');

    constructor() {
        inject(Router).events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.navigating.set(true);
            } else if (
                event instanceof NavigationEnd ||
                event instanceof NavigationCancel ||
                event instanceof NavigationError ||
                event instanceof NavigationSkipped
            ) {
                this.navigating.set(false);
            }
        });

        effect((onCleanup) => {
            if (this.navigating() || this.loading.busy()) {
                const timer = setTimeout(() => {
                    clearTimeout(this.idleTimer);
                    this.state.set('running');
                }, SHOW_DELAY);

                onCleanup(() => clearTimeout(timer));
            } else if (untracked(this.state) === 'running') {
                this.state.set('finishing');
                this.idleTimer = setTimeout(() => this.state.set('idle'), FINISH_DURATION + FADE_DURATION);
            }
        });
    }
}
