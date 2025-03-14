import { ChangeDetectionStrategy, Component, inject, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    DateAdapter,
    DateFormatter,
    KBQ_VALIDATION,
    KbqComponentColors,
    KbqFormattersModule,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule, KbqListSelection } from '@koobiq/components/list';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqDateTimeValue } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    standalone: true,
    selector: 'kbq-pipe-datetime',
    templateUrl: 'pipe-datetime.html',
    styleUrls: ['base-pipe.scss', 'pipe-date.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: KBQ_VALIDATION,
            useValue: { useValidation: false }
        },
        {
            provide: KbqBasePipe,
            useExisting: this
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
        KbqPipeState,
        KbqFormattersModule,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeTitleDirective,
        FormsModule
    ]
})
export class KbqPipeDatetimeComponent<D> extends KbqBasePipe<KbqDateTimeValue> {
    protected readonly adapter = inject(DateAdapter);
    protected readonly formatter = inject(DateFormatter);

    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;

    protected formGroup: FormGroup;

    protected showStartCalendar: boolean = false;
    protected showEndCalendar: boolean = false;

    get formattedValue(): string {
        if (this.start && this.end) {
            return this.formatter.rangeShortDate(this.start, this.end);
        }

        return this.data.value?.name ?? '';
    }

    get disabled(): boolean {
        return (
            !this.adapter.isDateInstance(this.formGroup.controls.start.value) ||
            !this.adapter.isDateInstance(this.formGroup.controls.end.value) ||
            this.formGroup.controls.start.invalid
        );
    }

    get start() {
        return this.adapter.parse(this.data.value?.start, '');
    }

    get end() {
        return this.adapter.parse(this.data.value?.end, '');
    }

    override get isEmpty(): boolean {
        if (this.data.value === null) return true;

        if (this.data.value?.name) return false;

        return !this.adapter.isDateInstance(this.start) || !this.adapter.isDateInstance(this.end);
    }

    @ViewChild('popover') popover: KbqPopoverTrigger;
    listSelection = viewChild.required('listSelection', { read: KbqListSelection });
    returnButton = viewChild.required('returnButton', { read: KbqButton });

    constructor() {
        super();

        this.formGroup = new FormGroup({
            start: new FormControl(this.start),
            end: new FormControl(this.end)
        });
    }

    onKeydown($event: KeyboardEvent) {
        if (($event.ctrlKey || $event.metaKey) && $event.keyCode === ENTER) {
            this.onApplyPeriod();
        }
    }

    onApplyPeriod() {
        this.data.value = {
            start: this.formGroup.controls.start.value.toISO(),
            end: this.formGroup.controls.end.value.toISO()
        };
        this.stateChanges.next();

        this.filterBar?.onChangePipe.next(this.data);

        this.popover.hide();
    }

    onSelect(item: KbqDateTimeValue) {
        this.data.value = item;
        this.stateChanges.next();

        this.filterBar?.onChangePipe.next(this.data);

        this.popover.hide();
    }

    openPeriod() {
        this.list = false;
        this.showStartCalendar = false;
        this.showEndCalendar = false;

        setTimeout(() => {
            this.popover.updatePosition(true);
            this.returnButton().focus();
        });
    }

    openList() {
        this.list = true;

        setTimeout(() => this.listSelection().focus());
        this.popover.updatePosition(true);
    }

    override open() {
        this.popover.show();
    }

    onSelectStartDate(value: D) {
        this.formGroup.controls.start.setValue(value);
    }

    onSelectEndDate(value: D) {
        this.formGroup.controls.end.setValue(value);
    }

    onFocusStartInput() {
        this.showStartCalendar = true;
        this.showEndCalendar = false;

        this.popover.updatePosition(true);
    }

    onFocusEndInput() {
        this.showEndCalendar = true;
        this.showStartCalendar = false;
    }

    hideCalendars() {
        this.showStartCalendar = false;
        this.showEndCalendar = false;
    }
}
