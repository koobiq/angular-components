import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    viewChild,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    DateAdapter,
    DateFormatter,
    KbqComponentColors,
    kbqDisableLegacyValidationDirectiveProvider,
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
import { filter } from 'rxjs/operators';
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
        kbqDisableLegacyValidationDirectiveProvider(),
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
export class KbqPipeDatetimeComponent<D> extends KbqBasePipe<KbqDateTimeValue> implements AfterViewInit {
    private readonly adapter = inject(DateAdapter);
    private readonly formatter = inject(DateFormatter);

    /** @docs-private */
    protected readonly placements = PopUpPlacements;
    /** @docs-private */
    protected readonly styles = KbqButtonStyles;
    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    /** Whether the current state is list of periods. When false will displayed control for set custom period */
    protected isListMode = true;

    /** @docs-private */
    protected formGroup: FormGroup;

    /** @docs-private */
    protected showStartCalendar: boolean = false;
    /** @docs-private */
    protected showEndCalendar: boolean = false;

    /** formatted value for period */
    get formattedValue(): string {
        if (this.start && this.end) {
            return this.formatter.rangeShortDateTime(this.start, this.end);
        }

        return this.data.value?.name ?? '';
    }

    /** Whether the current pipe is disabled. */
    get disabled(): boolean {
        return (
            !this.adapter.isDateInstance(this.formGroup.controls.start.value) ||
            !this.adapter.isDateInstance(this.formGroup.controls.end.value) ||
            this.formGroup.controls.start.invalid
        );
    }

    /** parsed start */
    get start(): D {
        return this.adapter.parse(this.data.value?.start, '');
    }

    /** default object for start */
    get defaultStart(): D {
        if (this.data.value?.start) {
            return this.adapter.today().plus(this.data.value?.start);
        }

        return this.adapter.today().startOf('day');
    }

    /** parsed end */
    get end(): D {
        return this.adapter.parse(this.data.value?.end, '');
    }

    /** default object for end */
    get defaultEnd(): D {
        if (this.data.value?.start) {
            return this.adapter.today();
        }

        return this.adapter.today().endOf('day');
    }

    /** Whether the current pipe is empty. */
    override get isEmpty(): boolean {
        if (this.data.value === null) return true;

        if (this.data.value?.name) return false;

        return !this.adapter.isDateInstance(this.start) || !this.adapter.isDateInstance(this.end);
    }

    /** @docs-private */
    @ViewChild('popover') popover: KbqPopoverTrigger;
    /** @docs-private */
    listSelection = viewChild.required('listSelection', { read: KbqListSelection });
    /** @docs-private */
    returnButton = viewChild.required('returnButton', { read: KbqButton });

    override ngAfterViewInit() {
        super.ngAfterViewInit();

        this.popover.visibleChange
            .pipe(
                filter((visible) => !visible),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.filterBar?.onClosePipe.next(this.data));
    }

    /** keydown handler
     * @docs-private */
    onKeydown($event: KeyboardEvent) {
        if (($event.ctrlKey || $event.metaKey) && $event.keyCode === ENTER) {
            this.onApplyPeriod();
        }

        if ($event.keyCode === ENTER) {
            $event.preventDefault();
        }
    }

    /** @docs-private */
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

    showPeriod() {
        this.isListMode = false;
        this.showStartCalendar = false;
        this.showEndCalendar = false;

        this.initFormGroup();

        setTimeout(() => {
            this.popover.updatePosition(true);
            this.returnButton().focus();
        });
    }

    showList() {
        this.isListMode = true;

        setTimeout(() => this.listSelection().focus());
        this.popover.updatePosition(true);
    }

    /** opens popover */
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

    private initFormGroup() {
        this.formGroup = new FormGroup({
            start: new FormControl(this.start || this.defaultStart),
            end: new FormControl(this.end || this.defaultEnd)
        });
    }
}
