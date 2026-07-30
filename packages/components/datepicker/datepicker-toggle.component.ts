import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    Directive,
    inject,
    Input,
    input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { KbqSiblingPopup, kbqSiblingPopupProvider } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { merge, Observable, Subscription } from 'rxjs';
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
        '(click)': 'open($event)'
    }
})
export class KbqDatepickerToggleIconComponent<D> implements AfterContentInit, OnChanges, OnDestroy, KbqSiblingPopup {
    /** Whether the toggle button is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get disabled(): boolean {
        return this.datepicker().disabled || this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled = false;

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
     * swapped later — the same reason `watchStateChanges` is re-run from `ngOnChanges`.
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

    private readonly destroyRef = inject(DestroyRef);
    private readonly cdr = inject(ChangeDetectorRef);
    private stateChangesSubscription = Subscription.EMPTY;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.datepicker && !changes.datepicker.firstChange) {
            this.watchStateChanges();
        }
    }

    ngAfterContentInit() {
        this.watchStateChanges();
    }

    ngOnDestroy() {
        this.stateChangesSubscription.unsubscribe();
    }

    /** Open datepicker */
    open($event: MouseEvent) {
        const datepicker = this.datepicker();

        if (datepicker && !this.disabled) {
            datepicker.open();
            $event.stopPropagation();
        }
    }

    private watchStateChanges() {
        this.stateChangesSubscription.unsubscribe();

        const datepicker = this.datepicker();

        if (!datepicker) return;

        this.stateChangesSubscription = merge(
            datepicker.disabledChange,
            datepicker.datepickerInput.disabledChange,
            outputToObservable(datepicker.openedStream),
            outputToObservable(datepicker.closedStream)
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.cdr.markForCheck());
    }
}
