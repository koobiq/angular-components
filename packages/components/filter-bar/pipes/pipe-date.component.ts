import { ChangeDetectionStrategy, Component, inject, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { DateAdapter, DateFormatter, KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule } from '@koobiq/components/list';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqButton } from '../../button';
import { KbqFormattersModule } from '../../core';
import { KbqDatepickerModule } from '../../datepicker';
import { KbqListSelection } from '../../list';
import { KbqPopoverTrigger } from '../../popover';
import { KbqTimepickerModule } from '../../timepicker';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeComponent } from '../pipe.component';
import { KbqPipeStates } from './pipe-states.component';

function groupValidator(adapter): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        const start = g.get('start')?.value;
        const end = g.get('end')?.value;

        if (!start || !end) return null;

        if (adapter.compareDateTime(start, end) > 0) {
            return { start: true };
        } else if (adapter.compareDateTime(end, start) < 0) {
            return { end: true };
        }

        return null;
    };
}

@Component({
    standalone: true,
    selector: 'kbq-pipe-date',
    templateUrl: 'pipe-date.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        KbqDividerModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqListModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqLuxonDateModule,
        KbqPipeStates,
        KbqFormattersModule
    ]
})
export class KbqPipeDateComponent {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly basePipe = inject(KbqPipeComponent);
    protected readonly adapter = inject(DateAdapter);
    protected readonly formatter = inject(DateFormatter);

    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;

    protected formGroup: FormGroup;

    get formattedValue(): string {
        const { start, end, showTime } = this.basePipe.data.value || {};

        if (start && end) {
            return showTime ? this.formatter.rangeShortDateTime(start, end) : this.formatter.rangeShortDate(start, end);
        }

        return this.basePipe.data.value?.name;
    }

    @ViewChild('popover') popover: KbqPopoverTrigger;
    listSelection = viewChild.required('listSelection', { read: KbqListSelection });
    returnButton = viewChild.required('returnButton', { read: KbqButton });

    protected readonly onkeydown = onkeydown;

    constructor() {
        this.formGroup = new FormGroup(
            {
                start: new FormControl(this.basePipe.data.value?.start),
                end: new FormControl(this.basePipe.data.value?.end)
            },
            {
                validators: [groupValidator(this.adapter)]
            }
        );
    }

    onKeydown($event: KeyboardEvent) {
        if ($event.ctrlKey && $event.keyCode === ENTER) {
            this.onApply();
        }
    }

    onApply() {
        this.basePipe.data.value.start = this.formGroup.get('start')?.value;
        this.basePipe.data.value.end = this.formGroup.get('end')?.value;

        this.filterBar.applyPipe(this.basePipe.data);

        this.popover.hide();
    }

    onSelect(item: unknown) {
        this.basePipe.data.value = item;
        this.basePipe.stateChanges.next();

        this.popover.hide();
    }

    openPeriod() {
        this.list = false;

        setTimeout(() => this.returnButton().focus());
    }

    openList() {
        this.list = true;

        setTimeout(() => this.listSelection().focus());
    }

    onDeleteOrClear() {
        if (this.basePipe.data.cleanable) {
            this.basePipe.data.value = undefined;
        } else if (this.basePipe.data.removable) {
            this.basePipe.onDeleteOrClear();
        }

        this.basePipe.stateChanges.next();
    }
}
