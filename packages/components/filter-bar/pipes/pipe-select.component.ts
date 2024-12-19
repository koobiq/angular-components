import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeStates } from './pipe-states.component';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[select]',
    template: `
        <kbq-select
            #select
            [value]="selected"
            [disabled]="data.disabled"
            [compareWith]="compareByValue"
            (selectionChange)="onSelect($event.value)"
        >
            <button
                [ngClass]="{ 'kbq-active': select.panelOpen }"
                [disabled]="data.disabled"
                [kbq-pipe-states]="data"
                kbq-button
                kbq-select-matcher
            >
                <span class="kbq-pipe__name">{{ data.name }}</span>
                <span class="kbq-pipe__value">{{ select.triggerValue }}</span>
            </button>

            @for (item of values; track item) {
                <kbq-option [value]="item">{{ item.name }}</kbq-option>
            }
        </kbq-select>

        @if (!data.required && !isEmpty) {
            <button
                class="kbq-pipe__delete"
                [disabled]="data.disabled"
                [kbq-pipe-states]="data"
                (click)="onDeleteOrClear()"
                kbq-button
            >
                <i kbq-icon="kbq-xmark-s_16"></i>
            </button>
        }
    `,
    styleUrls: ['pipe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe kbq-pipe_select',
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
        KbqPipeStates
    ]
})
export class KbqPipeSelectComponent extends KbqPipeBase {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    get isEmpty(): boolean {
        return this.data.value === undefined;
    }

    get selected() {
        return this.data.value;
    }

    override onDeleteOrClear() {
        if (this.data.cleanable) {
            this.data.value = undefined;
        } else if (this.data.removable) {
            super.onDeleteOrClear();
        }

        this.stateChanges.next();
    }

    onSelect(item: unknown) {
        this.data.value = item;
        this.stateChanges.next();
    }

    compareByValue = (o1: any, o2: any): boolean => o1 && o2 && o1.value === o2.value;
}
