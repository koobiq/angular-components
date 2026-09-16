import { Injectable, inject, signal } from '@angular/core';
import { KbqStateSavingService } from '@koobiq/components/core';

const STORAGE_KEY = 'docs-migration-done';

/**
 * The steps the reader has marked done, by heading id. The id is the step's anchor and carries no
 * ordinal, so a step inserted into the guide leaves every other mark in place; renaming a heading
 * strands its mark, which the state store's expiry collects.
 */
@Injectable()
export class DocsMigrationProgress {
    private readonly stateSaving = inject(KbqStateSavingService);

    readonly done = signal<ReadonlySet<string>>(this.restore());

    mark(step: string, done: boolean): void {
        const next = new Set(this.done());

        if (done) {
            next.add(step);
        } else {
            next.delete(step);
        }

        this.done.set(next);

        if (!this.stateSaving.isEnabled()) return;

        if (next.size) {
            this.stateSaving.write(STORAGE_KEY, [...next]);
        } else {
            this.stateSaving.remove(STORAGE_KEY);
        }
    }

    private restore(): ReadonlySet<string> {
        // Web storage is user-writable, so anything but a list of ids is ignored.
        const stored = this.stateSaving.isEnabled() ? this.stateSaving.read(STORAGE_KEY) : null;

        return new Set(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []);
    }
}
