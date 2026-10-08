import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    input,
    OnChanges,
    signal,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, toObservable } from '@angular/core/rxjs-interop';
import { KbqSiblingPopup, kbqSiblingPopupProvider } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { merge, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { KbqDatepicker } from './datepicker.component';

/** Can be used to override the icon of a `kbqDatepickerToggle`. */
@Directive({
    selector: '[kbqDatepickerToggleIcon]'
})
export class KbqDatepickerToggleIcon {}

@Component({
    selector: 'kbq-datepicker-toggle-icon',
    imports: [KbqIconModule],
    template: `
        <ng-content select="[kbqDatepickerToggleIcon]">
            <i
                color="contrast-fade"
                kbq-icon-button="kbq-calendar-o_16"
                [tabindex]="-1"
                [class.kbq-active]="datepicker() && datepicker().opened"
                [disabled]="disabled"
                [autoColor]="true"
            ></i>
        </ng-content>
    `,
    styleUrls: ['./datepicker-toggle.scss'],
    providers: [kbqSiblingPopupProvider(KbqDatepickerToggleIconComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-datepicker-toggle-icon',
        '[attr.aria-expanded]': 'datepicker().opened',
        '[attr.aria-disabled]': 'disabled',
        '(mousedown)': 'onMousedown($event)',
        '(click)': 'open($event)'
    }
})
export class KbqDatepickerToggleIconComponent<D> implements OnChanges, KbqSiblingPopup {
    /** Whether the toggle button is disabled. */
    get disabled(): boolean {
        return this.datepicker().disabled || this.disabledState();
    }

    set disabled(value: boolean) {
        this.disabledState.set(coerceBooleanProperty(value));
    }

    private readonly disabledState = signal(false);

    /** @docs-private */
    readonly disabledInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** Datepicker instance that the button will toggle. */
    readonly datepicker = input<KbqDatepicker<D>>(undefined!, { alias: 'for' });

    /** Whether the calendar is currently on screen. Part of the `KbqSiblingPopup` contract. */
    get isAttached(): boolean {
        return !!this.datepicker()?.opened;
    }

    /**
     * Emits `true` when the calendar opens and `false` when it closes. Part of the `KbqSiblingPopup`
     * contract.
     *
     * Built on top of the `datepicker` signal rather than read once, because the instance is bound after the
     * consumers of this stream (a tooltip on the same element subscribes in its constructor) and may be
     * swapped later.
     */
    readonly openedChange: Observable<boolean> = toObservable(this.datepicker).pipe(
        filter(Boolean),
        switchMap((datepicker) =>
            merge(
                outputToObservable(datepicker.openedStream).pipe(map(() => true)),
                outputToObservable(datepicker.closedStream).pipe(map(() => false))
            )
        )
    );

    /** Whether the calendar was open when the toggle was pressed. */
    private openedOnPress = false;

    ngOnChanges(changes: SimpleChanges) {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['disabledInput']) {
            const disabled = this.disabledInput();

            if (disabled !== undefined) this.disabled = disabled;
        }
    }

    /** Opens the calendar, moving the focus to its input; closes it instead when it was open at the press. */
    open($event: MouseEvent) {
        const datepicker = this.datepicker();
        const openedOnPress = this.openedOnPress;

        this.openedOnPress = false;

        if (!datepicker || this.disabled) return;

        $event.stopPropagation();

        // A click on the toggle of an open calendar closes it. The overlay has usually done so before the click gets
        // here, taking it for a click outside the calendar.
        if (openedOnPress) {
            datepicker.close();

            return;
        }

        // The input, not the icon, handles the keys of the datepicker and gets the focus back once it closes.
        datepicker.datepickerInput.focus();
        datepicker.open();
    }

    /** @internal */
    protected onMousedown(event: MouseEvent): void {
        // A press on the icon, focusable by its `tabindex`, would take the focus from the input.
        event.preventDefault();

        this.openedOnPress = !!this.datepicker()?.opened;
    }
}
