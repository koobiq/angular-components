import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeComponent } from '../pipe.component';
import { KbqPipeStates } from './pipe-states.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe-select',
    templateUrl: 'pipe-select.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonModule,
        KbqIcon,
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeStates
    ]
})
export class KbqPipeSelectComponent {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly basePipe = inject(KbqPipeComponent);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    get selected() {
        return this.basePipe.data.value;
    }

    get isEmpty(): boolean {
        return this.basePipe.data.value === null || this.basePipe.data.value === undefined;
    }

    constructor() {
        this.basePipe.stateChanges.subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });

        this.basePipe.pipeInstance = this;
    }

    onSelect(item: unknown) {
        this.basePipe.data.value = item;
        this.basePipe.stateChanges.next();
    }

    compareByValue = (o1: any, o2: any): boolean => o1 && o2 && o1.id === o2.id;
}
