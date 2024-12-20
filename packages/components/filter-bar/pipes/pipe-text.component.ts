import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { PopUpPlacements } from '../../core';
import { KbqPopoverModule } from '../../popover';
import { KbqTextareaModule } from '../../textarea';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeStates } from './pipe-states.component';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[text]',
    template: `
        <button
            #popover="kbqPopover"
            [ngClass]="{ 'kbq-active': popover.isOpen }"
            [disabled]="data.disabled"
            [kbq-pipe-states]="data"
            [kbqPopoverContent]="content"
            [kbqPopoverFooter]="footer"
            [kbqPopoverPlacement]="placements.BottomLeft"
            [kbqPopoverClass]="'kbq-pipe__popover'"
            kbq-button
            kbqPopover
        >
            <span class="kbq-pipe__name">{{ data.name }}</span>
            <span class="kbq-pipe__value">{{ data.value }}</span>
        </button>

        <ng-template #content>
            <kbq-form-field>
                <textarea
                    [ngModel]="data.value"
                    [canGrow]="false"
                    (ngModelChange)="onChange($event)"
                    (keydown)="onCtrlEnter($event)"
                    kbqTextarea
                    placeholder="Placeholder"
                    rows="2"
                ></textarea>
            </kbq-form-field>
        </ng-template>

        <ng-template #footer>
            <button
                [color]="'theme'"
                [kbqStyle]="'transparent'"
                [disabled]="isEmpty && !viewValue"
                (click)="onApply()"
                kbq-button
            >
                <span>Применить</span>
                &nbsp;
                <span class="kbq-button_hot-key">Ctrl + Enter</span>
            </button>
        </ng-template>

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
        class: 'kbq-pipe kbq-pipe_text',
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
        KbqFormFieldModule,
        KbqPopoverModule,
        KbqIcon,
        KbqInputModule,
        KbqDividerModule,
        KbqPipeStates,
        KbqFormFieldModule,
        FormsModule,
        KbqTextareaModule,
        NgClass
    ]
})
export class KbqPipeTextComponent extends KbqPipeBase {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    readonly placements = PopUpPlacements;

    get isEmpty(): boolean {
        return this.data.value === undefined;
    }

    get selected() {
        return this.data.value;
    }

    viewValue: string;

    override onDeleteOrClear() {
        if (this.data.cleanable) {
            this.data.value = undefined;
        } else if (this.data.removable) {
            super.onDeleteOrClear();
        }

        this.stateChanges.next();
    }

    onChange(value: string) {
        this.viewValue = value;
    }

    onApply() {
        this.data.value = this.viewValue;
        this.stateChanges.next();
    }

    onCtrlEnter({ ctrlKey, keyCode }) {
        if (ctrlKey && keyCode === ENTER) {
            this.data.value = this.viewValue;
            this.stateChanges.next();
        }
    }
}
