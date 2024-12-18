import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '../../select';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeStates } from './pipe-states.component';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[multi-select]',
    template: `
        <kbq-select
            #select
            [value]="selected"
            [disabled]="data.disabled"
            [compareWith]="compareByValue"
            (selectionChange)="onSelect($event.value)"
            multiple
        >
            <button
                [ngClass]="{ 'kbq-active': select.panelOpen }"
                [disabled]="data.disabled"
                [kbq-pipe-states]="data"
                kbq-button
                kbq-select-matcher
            >
                <span class="kbq-pipe__name">{{ data.name }}</span>
                @if (select.triggerValues!.length === 1) {
                    <span class="kbq-pipe__value">{{ select.triggerValue }}</span>
                } @else if (select.triggerValues!.length > 1) {
                    <kbq-badge [badgeColor]="'contrast'" [compact]="true">
                        {{ select.triggerValues!.length }}
                    </kbq-badge>
                }
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
        KbqDropdownModule,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
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
