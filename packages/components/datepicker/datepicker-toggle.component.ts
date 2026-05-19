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
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqIconModule } from '@koobiq/components/icon';
import { merge, Subscription } from 'rxjs';
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
                [class.kbq-active]="datepicker && datepicker.opened"
                [disabled]="disabled"
                [autoColor]="true"
            ></i>
        </ng-content>
    `,
    styleUrls: ['./datepicker-toggle.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-datepicker-toggle-icon',
        '[attr.aria-expanded]': 'datepicker.opened',
        '[attr.aria-disabled]': 'disabled',
        '(click)': 'open($event)'
    }
})
export class KbqDatepickerToggleIconComponent<D> implements AfterContentInit, OnChanges, OnDestroy {
    /** Whether the toggle button is disabled. */
    @Input()
    get disabled(): boolean {
        return this.datepicker.disabled || this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled = false;

    /** Datepicker instance that the button will toggle. */
    @Input('for') datepicker: KbqDatepicker<D>;

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
        if (this.datepicker && !this.disabled) {
            this.datepicker.open();
            $event.stopPropagation();
        }
    }

    private watchStateChanges() {
        this.stateChangesSubscription.unsubscribe();

        if (!this.datepicker) return;

        this.stateChangesSubscription = merge(
            this.datepicker.disabledChange,
            this.datepicker.datepickerInput.disabledChange,
            this.datepicker.openedStream,
            this.datepicker.closedStream
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.cdr.markForCheck());
    }
}
