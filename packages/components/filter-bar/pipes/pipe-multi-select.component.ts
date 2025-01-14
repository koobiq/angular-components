import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeStates } from './pipe-states.component';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[multi-select]',
    templateUrl: 'pipe-multi-select.template.html',
    styleUrls: ['pipe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe kbq-pipe_multi-select',
        '[class.kbq-pipe_empty]': 'isEmpty',
        '[class.kbq-pipe_readonly]': 'data.required',
        '[class.kbq-pipe_disabled]': 'data.disabled'
    },
    providers: [
        {
            provide: KbqPipeBase,
            useExisting: this
        }
    ],
    imports: [
        KbqButtonModule,
        KbqIcon,
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeStates,
        KbqBadgeModule
    ]
})
export class KbqPipeMultiSelectComponent extends KbqPipeBase {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    get isEmpty(): boolean {
        if (Array.isArray(this.data.value)) {
            return this.data.value.length === 0;
        }

        return true;
    }

    get selected() {
        return this.data.value;
    }

    override onDeleteOrClear() {
        if (this.data.cleanable) {
            this.data.value = [];
        } else if (this.data.removable) {
            super.onDeleteOrClear();
        }

        this.stateChanges.next();
    }

    onSelect(item: unknown) {
        console.log('onSelect: ');
        this.data.value = item;
        this.stateChanges.next();
    }

    compareByValue = (o1: any, o2: any): boolean => o1 && o2 && o1.value === o2.value;
}
