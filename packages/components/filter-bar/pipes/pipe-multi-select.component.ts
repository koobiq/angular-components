import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeComponent } from '../pipe.component';
import { KbqPipeStates } from './pipe-states.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe-multi-select',
    templateUrl: 'pipe-multi-select.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqIcon,
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeStates,
        KbqBadgeModule
    ]
})
export class KbqPipeMultiSelectComponent {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly basePipe = inject(KbqPipeComponent);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    get selected() {
        return this.basePipe.data.value;
    }

    get isEmpty(): boolean {
        return !this.basePipe.data.value?.length;
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

    compareByValue = (o1: any, o2: any): boolean => o1?.value === o2?.id;
}
