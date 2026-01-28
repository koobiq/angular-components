import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Overlay, OverlayConfig, OverlayRef, PositionStrategy, ScrollStrategy } from '@angular/cdk/overlay';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    inject,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Output,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter, defaultOffsetY } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { merge, Subject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { KbqCalendarCellCssClasses } from './calendar-body.component';
import { KbqCalendar } from './calendar.component';
import { kbqDatepickerAnimations } from './datepicker-animations';
import { createMissingDateImplError } from './datepicker-errors';
import { KbqDatepickerInput } from './datepicker-input.directive';

/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;

/** Injection token that determines the scroll handling while the calendar is open. */
export const KBQ_DATEPICKER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-datepicker-scroll-strategy'
);

/** @docs-private */
export function KBQ_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const KBQ_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_DATEPICKER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: KBQ_DATEPICKER_SCROLL_STRATEGY_FACTORY
};

/**
 * Component used as the content for the datepicker dialog and popup. We use this instead of using
 * KbqCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the popup that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
@Component({
    selector: 'kbq-datepicker__content',
    exportAs: 'kbqDatepickerContent',
    templateUrl: 'datepicker-content.html',
    styleUrls: ['datepicker-content.scss', 'datepicker-tokens.scss'],
    host: {
        class: 'kbq-datepicker__content',

        '[@transformPanel]': 'animationState',
        '(@transformPanel.done)': 'animationDone.next()'
    },
    animations: [
        kbqDatepickerAnimations.transformPanel,
        kbqDatepickerAnimations.fadeInCalendar
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDatepickerContent<D> implements OnDestroy, AfterViewInit {
    /** Emits when an animation has finished. */
    readonly animationDone = new Subject<void>();

    /** Reference to the datepicker that created the overlay. */
    datepicker: KbqDatepicker<D>;

    /** Current state of the animation. */
    animationState: 'enter' | 'void';

    /** Reference to the internal calendar component. */
    @ViewChild(KbqCalendar) calendar: KbqCalendar<D>;

    private subscriptions = new Subscription();

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.subscriptions.add(
            this.datepicker.stateChanges.subscribe(() => {
                this.changeDetectorRef.markForCheck();
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
        this.animationDone.complete();
    }

    startExitAnimation() {
        this.animationState = 'void';
        this.changeDetectorRef.markForCheck();
    }
}

// TODO: We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="kbqDatepicker"). We can change this to a directive
// if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the datepicker popup/dialog. */
@Component({
    selector: 'kbq-datepicker',
    template: '',
    exportAs: 'kbqDatepicker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: KbqFormFieldControl, useExisting: KbqDatepicker }]
})
export class KbqDatepicker<D> implements OnDestroy {
    protected readonly document = inject<Document>(DOCUMENT);

    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    private _hasBackdrop: boolean = false;

    /** The date to open the calendar to initially. */
    @Input()
    get startAt(): D | null {
        // If an explicit startAt is set we start there, otherwise we start at whatever the currently
        // selected value is.
        return this._startAt || this.datepickerInput?.value;
    }

    set startAt(value: D | null) {
        const deserializedValue = this.dateAdapter.deserialize(value);

        this._startAt =
            deserializedValue !== null
                ? this.dateAdapter.clampDate(deserializedValue, this.minDate, this.maxDate)
                : null;
    }

    private _startAt: D | null;

    /** Whether the datepicker pop-up should be disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled === undefined && this.datepickerInput ? this.datepickerInput.disabled : this._disabled;
    }

    set disabled(value: boolean) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.disabledChange.next(newValue);
        }
    }

    private _disabled: boolean;

    /** Whether the calendar is open. */
    @Input()
    get opened(): boolean {
        return this._opened;
    }

    set opened(value: boolean) {
        coerceBooleanProperty(value) ? this.open() : this.close();
    }

    private _opened = false;

    /** The currently selected date. */
    get selected(): D | null {
        return this.validSelected;
    }

    set selected(value: D | null) {
        this.validSelected = value;
    }

    get dateFilter(): (date: D | null) => boolean {
        return this.datepickerInput && this.datepickerInput.dateFilter;
    }

    get value(): D | null {
        return this.selected;
    }

    /** The minimum selectable date. */
    @Input() minDate: D | null;

    /** The maximum selectable date. */
    @Input() maxDate: D | null;

    /**
     * Emits selected year in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits selected month in year view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

    /** Classes to be passed to the date picker panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[];

    /** Function that can be used to add custom CSS classes to dates. */
    @Input() dateClass: (date: D) => KbqCalendarCellCssClasses;

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Emits when the datepicker has been opened. */
    @Output('opened') readonly openedStream: EventEmitter<void> = new EventEmitter<void>();

    /** Emits when the datepicker has been closed. */
    @Output('closed') readonly closedStream: EventEmitter<void> = new EventEmitter<void>();

    readonly stateChanges: Subject<void> = new Subject<void>();

    /** Emits when the datepicker is disabled. */
    readonly disabledChange = new Subject<boolean>();

    /** Emits new selected date when selected date changes. */
    readonly selectedChanged = new Subject<D>();

    /** The id for the datepicker calendar. */
    id: string = `kbq-datepicker-${datepickerUid++}`;

    /** A reference to the overlay when the calendar is opened as a popup. */
    popupRef: OverlayRef | null;

    /** The input element this datepicker is associated with. */
    datepickerInput: KbqDatepickerInput<D>;

    private scrollStrategy: () => ScrollStrategy;

    private validSelected: D | null = null;

    /** A portal containing the calendar for this datepicker. */
    private calendarPortal: ComponentPortal<KbqDatepickerContent<D>>;

    /** Reference to the component instantiated in popup mode. */
    private popupComponentRef: ComponentRef<KbqDatepickerContent<D>> | null;

    /** The element that was focused before the datepicker was opened. */
    private focusedElementBeforeOpen: HTMLElement | null = null;

    /** Subscription to value changes in the associated input element. */
    private inputSubscription = Subscription.EMPTY;

    private closeSubscription = Subscription.EMPTY;

    constructor(
        private overlay: Overlay,
        private ngZone: NgZone,
        private viewContainerRef: ViewContainerRef,
        @Inject(KBQ_DATEPICKER_SCROLL_STRATEGY) scrollStrategy: any,
        @Optional() private readonly dateAdapter: DateAdapter<D>,
        @Optional() private dir: Directionality
    ) {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        this.scrollStrategy = scrollStrategy;
    }

    ngOnDestroy() {
        this.close();
        this.inputSubscription.unsubscribe();
        this.closeSubscription.unsubscribe();
        this.disabledChange.complete();

        this.destroyOverlay();
    }

    /** Selects the given date */
    select(date: D): void {
        const oldValue = this.selected;

        this.selected = date;

        if (!this.dateAdapter.sameDate(oldValue, this.selected)) {
            this.selectedChanged.next(date);
        }
    }

    /** Emits the selected year in multiyear view */
    selectYear(normalizedYear: D): void {
        this.yearSelected.emit(normalizedYear);
    }

    /** Emits selected month in year view */
    selectMonth(normalizedMonth: D): void {
        this.monthSelected.emit(normalizedMonth);
    }

    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     */
    registerInput(input: KbqDatepickerInput<D>): void {
        if (this.datepickerInput) {
            throw Error('A KbqDatepicker can only be associated with a single input.');
        }

        this.datepickerInput = input;
        this.inputSubscription = this.datepickerInput.valueChange.subscribe((value: D | null) => {
            this.selected = value;

            if (this.popupComponentRef) {
                this.popupComponentRef.instance.calendar.monthView?.init();
                this.popupComponentRef.instance.calendar.activeDate = value as D;
            }
        });
    }

    /** Open the calendar. */
    open(): void {
        if (this._opened || this.disabled) {
            return;
        }

        if (!this.datepickerInput) {
            throw Error('Attempted to open an KbqDatepicker with no associated input.');
        }

        if (this.document) {
            this.focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
        }

        this.openAsPopup();

        this._opened = true;
        this.openedStream.emit();
    }

    /** Close the calendar. */
    close(restoreFocus: boolean = true): void {
        if (!this._opened) {
            return;
        }

        if (this.popupComponentRef) {
            const instance = this.popupComponentRef.instance;

            instance.startExitAnimation();

            instance.animationDone.pipe(take(1)).subscribe(() => this.destroyOverlay());
        }

        if (restoreFocus) {
            this.focusedElementBeforeOpen!.focus();
        }

        this._opened = false;
        this.closedStream.emit();
        this.focusedElementBeforeOpen = null;
    }

    toggle(): void {
        if (this.datepickerInput.isReadOnly) {
            return;
        }

        this._opened ? this.close() : this.open();
    }

    /** Destroys the current overlay. */
    private destroyOverlay() {
        if (this.popupRef) {
            this.popupRef.dispose();
            this.popupRef = this.popupComponentRef = null;
        }
    }

    /** Open the calendar as a popup. */
    private openAsPopup(): void {
        if (!this.calendarPortal) {
            this.calendarPortal = new ComponentPortal<KbqDatepickerContent<D>>(
                KbqDatepickerContent,
                this.viewContainerRef
            );
        }

        if (!this.popupRef) {
            this.createPopup();
        }

        if (!this.popupRef!.hasAttached()) {
            this.popupComponentRef = this.popupRef!.attach(this.calendarPortal);
            this.popupComponentRef.instance.datepicker = this;

            // Update the position once the calendar has rendered.
            this.ngZone.onStable
                .asObservable()
                .pipe(take(1))
                .subscribe(() => this.popupRef?.updatePosition());
        }
    }

    /** Create the popup. */
    private createPopup(): void {
        const overlayConfig = new OverlayConfig({
            positionStrategy: this.createPopupPositionStrategy(),
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass,
            direction: this.dir,
            scrollStrategy: this.scrollStrategy(),
            panelClass: 'kbq-datepicker__popup'
        });

        this.popupRef = this.overlay.create(overlayConfig);

        this.closeSubscription = this.closingActions().subscribe(() => this.close(this.restoreFocus()));
    }

    private restoreFocus(): boolean {
        return this.document.activeElement === this.document.body;
    }

    private closingActions() {
        return merge(
            this.popupRef!.backdropClick(),
            this.popupRef!.outsidePointerEvents(),
            this.popupRef!.detachments()
        );
    }

    /** Create the popup PositionStrategy. */
    private createPopupPositionStrategy(): PositionStrategy {
        return this.overlay
            .position()
            .flexibleConnectedTo(this.datepickerInput.getOrigin())
            .withTransformOriginOn('.kbq-datepicker__content')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withLockedPosition()
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetY: defaultOffsetY
                },
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom',
                    offsetY: -defaultOffsetY
                },
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top'
                },
                {
                    originX: 'end',
                    originY: 'top',
                    overlayX: 'end',
                    overlayY: 'bottom'
                }
            ]);
    }
}
