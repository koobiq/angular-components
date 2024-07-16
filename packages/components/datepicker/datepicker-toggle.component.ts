import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqButton } from '@koobiq/components/button';
import { Subscription, merge, of as observableOf } from 'rxjs';
import { KbqDatepickerIntl } from './datepicker-intl';
import { KbqDatepicker } from './datepicker.component';

/** Can be used to override the icon of a `kbqDatepickerToggle`. */
@Directive({
    selector: '[kbqDatepickerToggleIcon]'
})
export class KbqDatepickerToggleIcon {}

@Component({
    selector: 'kbq-datepicker-toggle',
    templateUrl: 'datepicker-toggle.html',
    styleUrls: ['datepicker-toggle.scss'],
    host: {
        class: 'kbq-datepicker-toggle',
        '[class.kbq-active]': 'datepicker && datepicker.opened'
    },
    exportAs: 'kbqDatepickerToggle',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
    /** Whether the toggle button is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled === undefined ? this.datepicker.disabled : this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    /** Datepicker instance that the button will toggle. */
    @Input('for') datepicker: KbqDatepicker<D>;

    /** Tabindex for the toggle. */
    @Input() tabIndex: number | null;

    /** Custom icon set by the consumer. */
    @ContentChild(KbqDatepickerToggleIcon, { static: false }) customIcon: KbqDatepickerToggleIcon;

    /** Underlying button element. */
    @ViewChild('button', { static: false }) button: KbqButton;
    private stateChanges = Subscription.EMPTY;

    private _disabled: boolean;

    constructor(
        public intl: KbqDatepickerIntl,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.datepicker) {
            this.watchStateChanges();
        }
    }

    ngOnDestroy() {
        this.stateChanges.unsubscribe();
    }

    ngAfterContentInit() {
        this.watchStateChanges();
    }

    open(event: Event): void {
        if (this.datepicker && !this.disabled) {
            this.datepicker.open();
            event.stopPropagation();
        }
    }

    private watchStateChanges() {
        const datepickerDisabled = this.datepicker ? this.datepicker.disabledChange : observableOf<boolean>();

        const inputDisabled =
            this.datepicker && this.datepicker.datepickerInput
                ? this.datepicker.datepickerInput.disabledChange
                : observableOf<boolean>();

        const datepickerToggled = this.datepicker
            ? merge(this.datepicker.openedStream, this.datepicker.closedStream)
            : observableOf<boolean>();

        this.stateChanges.unsubscribe();

        this.stateChanges = merge(this.intl.changes, datepickerDisabled, inputDisabled, datepickerToggled).subscribe(
            () => this.changeDetectorRef.markForCheck()
        );
    }
}
