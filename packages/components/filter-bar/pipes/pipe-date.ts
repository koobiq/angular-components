import { ChangeDetectionStrategy, Component, inject, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
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
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';

@Component({
    standalone: true,
    selector: 'kbq-pipe-date',
    templateUrl: 'pipe-date.html',
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
        KbqLuxonDateModule,
        KbqPipeState,
        KbqFormattersModule,
        KbqPipeButton,
        KbqTitleModule
    ]
})
export class KbqPipeDateComponent extends KbqBasePipe {
    protected readonly adapter = inject(DateAdapter);
    protected readonly formatter = inject(DateFormatter);

    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;

    protected formGroup: FormGroup;

    get formattedValue(): string {
        const { start, end } = this.data.value || {};

        if (start && end) {
            return this.formatter.rangeShortDate(start, end);
        }

        return this.data.value?.name;
    }

    get disabled(): boolean {
        return this.isEmpty || this.formGroup.controls.start.invalid;
    }

    override get isEmpty(): boolean {
        if (this.data.value === null) return true;

        if (this.data.value?.name) return false;

        return (
            !this.adapter.isDateInstance(this.formGroup.get('start')?.value) ||
            !this.adapter.isDateInstance(this.formGroup.get('end')?.value)
        );
    }

    @ViewChild('popover') popover: KbqPopoverTrigger;
    listSelection = viewChild.required('listSelection', { read: KbqListSelection });
    returnButton = viewChild.required('returnButton', { read: KbqButton });

    protected readonly onkeydown = onkeydown;

    constructor() {
        super();

        this.formGroup = new FormGroup({
            start: new FormControl(this.data.value?.start),
            end: new FormControl(this.data.value?.end)
        });
    }

    onKeydown($event: KeyboardEvent) {
        if ($event.ctrlKey && $event.keyCode === ENTER) {
            this.onApplyPeriod();
        }
    }

    onApplyPeriod() {
        this.data.value = {
            start: this.formGroup.get('start')?.value,
            end: this.formGroup.get('end')?.value
        };

        this.filterBar?.onChangePipe.next(this.data);

        this.popover.hide();
    }

    onSelect(item: unknown) {
        this.data.value = item;
        this.stateChanges.next();

        this.filterBar?.onChangePipe.next(this.data);

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

    onDelete() {
        if (this.data.cleanable) {
            this.data.value = null;
        } else {
            this.filterBar?.removePipe(this.data);
        }

        // this.stateChanges.next();
    }
}
