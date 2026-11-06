import { computed, Injectable, signal } from '@angular/core';
import { defer, finalize, Observable } from 'rxjs';

/** What the site is waiting for besides a navigation, such as the content of the open page: the progress bar shows it. */
@Injectable({ providedIn: 'root' })
export class DocsNextLoading {
    private readonly pending = signal(0);

    readonly busy = computed(() => this.pending() > 0);

    /** Counts the source as a wait from its subscription until it completes or is unsubscribed from. */
    track<T>(source: Observable<T>): Observable<T> {
        return defer(() => {
            this.pending.update((count) => count + 1);

            return source.pipe(finalize(() => this.pending.update((count) => count - 1)));
        });
    }
}
