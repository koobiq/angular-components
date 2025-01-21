import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    viewChild,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { KBQ_VALIDATION, KbqFormattersModule } from '../../core';
import { KbqDatepickerModule } from '../../datepicker';
import { KbqListSelection } from '../../list';
import { KbqPopoverTrigger } from '../../popover';
import { KbqTimepickerModule } from '../../timepicker';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeComponent } from '../pipe.component';
import { KbqPipeStates } from './pipe-states.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe-date',
    templateUrl: 'pipe-date.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: KBQ_VALIDATION,
            useValue: { useValidation: false }
        }
    ],
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
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;

    protected formGroup: FormGroup;
    protected showTimepicker: boolean = false;

    get formattedValue(): string {
        const { start, end, time } = this.data.value || {};

        if (start && end) {
            return time ? this.formatter.rangeShortDateTime(start, end) : this.formatter.rangeShortDate(start, end);
        }

        return this.data.value?.name;
    }

    get disabled(): boolean {
        return this.isEmpty || this.formGroup.controls.start.invalid;
    }

    @ViewChild('popover') popover: KbqPopoverTrigger;
    listSelection = viewChild.required('listSelection', { read: KbqListSelection });
    returnButton = viewChild.required('returnButton', { read: KbqButton });

    protected readonly onkeydown = onkeydown;

    constructor() {
        this.formGroup = new FormGroup({
            start: new FormControl(this.data.value?.start),
            end: new FormControl(this.data.value?.end)
        });

        this.showTimepicker = this.data.value?.time;

        this.basePipe.stateChanges.subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });

        this.basePipe.pipeInstance = this;
    }

    get isEmpty(): boolean {
        if (this.data.value === null) return true;

        if (this.data.value?.name) return false;

        return (
            !this.adapter.isDateInstance(this.formGroup.get('start')?.value) ||
            !this.adapter.isDateInstance(this.formGroup.get('end')?.value)
        );
    }

    get data() {
        return this.basePipe.data;
    }

    onKeydown($event: KeyboardEvent) {
        if ($event.ctrlKey && $event.keyCode === ENTER) {
            this.onApply();
        }
    }

    onApply() {
        this.data.value = {
            start: this.formGroup.get('start')?.value,
            end: this.formGroup.get('end')?.value
        };

        this.filterBar.applyPipe(this.data);

        this.popover.hide();
    }

    onSelect(item: unknown) {
        this.data.value = item;
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
}
