import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
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
import { KbqBasePipe } from './base-pipe';
import { KbqPipeState } from './pipe-state';

@Component({
    standalone: true,
    selector: 'kbq-pipe-text',
    templateUrl: 'pipe-text.html',
    styleUrls: ['base-pipe.scss', 'pipe-text.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: KbqBasePipe,
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
        KbqPipeState,
        FormsModule,
        KbqTextareaModule,
        NgClass
    ]
})
export class KbqPipeTextComponent extends KbqBasePipe {
    readonly placements = PopUpPlacements;

    viewValue: string;

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
