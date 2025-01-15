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
import { KbqPipeComponent } from '../pipe.component';
import { KbqPipeStates } from './pipe-states.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe-text',
    templateUrl: 'pipe-text.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
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
export class KbqPipeTextComponent {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly basePipe = inject(KbqPipeComponent);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    readonly placements = PopUpPlacements;

    get selected() {
        return this.basePipe.data.value;
    }

    viewValue: string;

    onDeleteOrClear() {
        if (this.basePipe.data.cleanable) {
            this.basePipe.data.value = undefined;
        } else if (this.basePipe.data.removable) {
            this.basePipe.onDeleteOrClear();
        }

        this.basePipe.stateChanges.next();
    }

    onChange(value: string) {
        this.viewValue = value;
    }

    onApply() {
        this.basePipe.data.value = this.viewValue;
        this.basePipe.stateChanges.next();
    }

    onCtrlEnter({ ctrlKey, keyCode }) {
        if (ctrlKey && keyCode === ENTER) {
            this.basePipe.data.value = this.viewValue;
            this.basePipe.stateChanges.next();
        }
    }
}
