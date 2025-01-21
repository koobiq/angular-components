import { ChangeDetectorRef, Directive, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeData, KbqPipeTemplate } from '../filter-bar.types';

@Directive({
    standalone: true,
    host: {
        class: 'kbq-pipe',
        '[class]': '"kbq-pipe__" + data.type',
        '[class.kbq-pipe_empty]': 'isEmpty',
        '[class.kbq-pipe_cleanable]': 'data.cleanable',
        '[class.kbq-pipe_removable]': 'data.removable',
        '[class.kbq-pipe_disabled]': 'data.disabled'
    }
})
export class KbqBasePipe {
    readonly stateChanges = new Subject<void>();
    readonly data = inject(KbqPipeData);

    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected values: KbqPipeTemplate[];

    get isEmpty(): boolean {
        return this.data.value === null || this.data.value === undefined;
    }

    protected readonly onkeydown = onkeydown;

    constructor() {
        this.stateChanges.subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });

        const template = this.filterBar.templates.find((template) => template.type === this.data?.type);

        if (template) {
            this.values = template.values as KbqPipeTemplate[];
        }
    }

    onDelete() {
        this.filterBar.deletePipe(this.data);

        this.stateChanges.next();
    }

    onClear() {
        this.data.value = null;

        this.stateChanges.next();
    }
}
