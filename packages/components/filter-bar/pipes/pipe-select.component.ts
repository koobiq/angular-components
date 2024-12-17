import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqButtonModule } from '../../button';
import { KbqSelectModule } from '../../select';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeStates } from './pipe-states.component';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[select]',
    template: `
        <kbq-select #select [value]="selected" [disabled]="data.disabled || data.readonly" (selectionChange)="onSelect($event.value)">
            <button
                [ngClass]="{ 'kbq-active': select.panelOpen }"
                [pipe]="data"
                [disabled]="data.disabled"
                kbq-button
                kbq-pipe-states
                kbq-select-matcher
            >
                <span class="kbq-pipe__name">{{ data.name }}</span>
                <span class="kbq-pipe__value">{{ select.triggerValue }}</span>
            </button>

            @for (item of values; track item) {
                <kbq-option [value]="item">{{ item.name }}</kbq-option>
            }
        </kbq-select>

        <button
            class="kbq-pipe__delete"
            [pipe]="data"
            [disabled]="data.disabled"
            (click)="onDelete()"
            kbq-button
            kbq-pipe-states
        >
            <i kbq-icon="kbq-xmark-s_16"></i>
        </button>
    `,
    styleUrls: ['pipe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe kbq-pipe_select',
        '[class.kbq-pipe_readonly]': 'data.readonly',
        '[class.kbq-pipe_disabled]': 'data.disabled',
        '[class.kbq-pipe_empty]': 'data.empty'
    },
    imports: [
        KbqButtonModule,
        KbqDropdownModule,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeStates
    ]
})
export class KbqPipeSelectComponent extends KbqPipeBase {
    protected readonly filterBar = inject(KbqFilterBar);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;
    selected: any;

    onSelect(item) {
        console.log('onSelect: ');

        this.data = {
            ...this.data,
            value: item.value,
            empty: false
        };
    }
}
