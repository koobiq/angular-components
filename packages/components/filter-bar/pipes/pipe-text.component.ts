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
    templateUrl: 'pipe-text.template.html',
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
