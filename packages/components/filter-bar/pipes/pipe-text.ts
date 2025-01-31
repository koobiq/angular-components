import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

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
        KbqInputModule,
        KbqDividerModule,
        FormsModule,
        KbqTextareaModule,
        NgClass,
        KbqPipeButton,
        ReactiveFormsModule,
        KbqTitleModule,
        KbqPipeState,
        KbqPipeTitleDirective
    ]
})
export class KbqPipeTextComponent extends KbqBasePipe implements OnInit {
    readonly placements = PopUpPlacements;

    @ViewChild('popover') popover: KbqPopoverTrigger;

    get disabled(): boolean {
        return !this.control.value || this.control.pristine;
    }

    control = new FormControl<string>('');

    ngOnInit(): void {
        this.control.setValue(this.data.value);
    }

    onApply() {
        this.data.value = this.control.value;
        this.stateChanges.next();

        this.control.markAsPristine();
        this.popover.hide();

        this.filterBar?.onChangePipe.next(this.data);
    }

    onKeydown($event: KeyboardEvent) {
        if (!this.disabled && $event.ctrlKey && $event.keyCode === ENTER) {
            this.onApply();
        }
    }
}
