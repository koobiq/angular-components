/* tslint:disable:no-empty */

import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, ConnectedPosition, OverlayContainer } from '@angular/cdk/overlay';
import { CdkVirtualForOf } from '@angular/cdk/scrolling';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    isDevMode,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    Renderer2,
    Self,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {
    ControlValueAccessor,
    FormGroupDirective,
    NgControl,
    NgForm
} from '@angular/forms';
import { ActiveDescendantKeyManager } from '@koobiq/cdk/a11y';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    UP_ARROW,
    A,
    TAB,
    ESCAPE,
    PAGE_UP,
    PAGE_DOWN,
    BACKSPACE,
    DELETE
} from '@koobiq/cdk/keycodes';
import {
    CanDisable,
    CanDisableCtor,
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    HasTabIndex,
    HasTabIndexCtor,
    KBQ_OPTION_PARENT_COMPONENT,
    KbqOptgroup,
    KbqOption,
    KbqOptionSelectionChange,
    mixinDisabled,
    mixinErrorState,
    mixinTabIndex,
    kbqSelectAnimations,

    SELECT_PANEL_INDENT_PADDING_X,
    SELECT_PANEL_PADDING_X,
    SELECT_PANEL_VIEWPORT_PADDING,
    KBQ_SELECT_SCROLL_STRATEGY,

    getKbqSelectDynamicMultipleError,
    getKbqSelectNonFunctionValueError,
    getKbqSelectNonArrayValueError,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService, KbqVirtualOption, KbqOptionBase
} from '@koobiq/components/core';
import { KbqCleaner, KbqFormField, KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqInput } from '@koobiq/components/input';
import { KbqTag } from '@koobiq/components/tags';
import { BehaviorSubject, defer, merge, Observable, Subject, Subscription } from 'rxjs';
import {
    filter,
    map,
    startWith,
    switchMap,
    take,
    takeUntil,
    distinctUntilChanged,
    delay
} from 'rxjs/operators';


let nextUniqueId = 0;

/** Change event object that is emitted when the select value has changed. */
export class KbqSelectChange {
    constructor(public source: KbqSelect, public value: any) {}
}


@Directive({
    selector: 'kbq-select-footer, [kbq-select-footer]',
    host: { class: 'kbq-select__footer' }
})
export class KbqSelectFooter {}

@Directive({
    selector: '[kbqSelectSearch]',
    exportAs: 'kbqSelectSearch',
    host: {
        '(keydown)': 'handleKeydown($event)'
    }
})
export class KbqSelectSearch implements AfterContentInit, OnDestroy {
    @ContentChild(KbqInput, { static: false }) input: KbqInput;

    searchChangesSubscription: Subscription = new Subscription();

    isSearchChanged: boolean = false;

    constructor(formField: KbqFormField) {
        formField.canCleanerClearByEsc = false;
    }

    focus(): void {
        this.input.focus();
    }

    reset(): void {
        this.input.ngControl.reset();
    }

    ngAfterContentInit(): void {
        if (!this.input) {
            throw Error('KbqSelectSearch does not work without kbqInput');
        }

        if (!this.input.ngControl) {
            throw Error('KbqSelectSearch does not work without ngControl');
        }

        Promise.resolve().then(() => {
            this.searchChangesSubscription = this.input.ngControl.valueChanges!.subscribe(() => {
                this.isSearchChanged = true;
            });
        });
    }

    ngOnDestroy(): void {
        this.searchChangesSubscription.unsubscribe();
    }

    handleKeydown(event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        if (event.keyCode === ESCAPE) {
            if (this.input.value) {
                this.reset();
                event.stopPropagation();
            }
        }

        // tslint:disable-next-line:deprecation
        if ([SPACE, HOME, END].includes(event.keyCode)) {
            event.stopPropagation();
        }
    }
}

@Directive({
    selector: '[kbq-select-search-empty-result]',
    exportAs: 'kbqSelectSearchEmptyResult'
})
export class KbqSelectSearchEmptyResult {}


@Directive({ selector: 'kbq-select-trigger, [kbq-select-trigger]' })
export class KbqSelectTrigger {}

@Directive({ selector: 'kbq-select-matcher, [kbq-select-matcher]' })
export class KbqSelectMatcher {}


/** @docs-private */
export class KbqSelectBase {
    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     * @docs-private
     */
    readonly stateChanges = new Subject<void>();

    constructor(
        public elementRef: ElementRef,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {}
}

/** @docs-private */
const KbqSelectMixinBase: CanDisableCtor & HasTabIndexCtor & CanUpdateErrorStateCtor &
    typeof KbqSelectBase = mixinTabIndex(mixinDisabled(mixinErrorState(KbqSelectBase)));


@Component({
    selector: 'kbq-select',
    exportAs: 'kbqSelect',
    templateUrl: 'select.html',
    styleUrls: ['./select.scss'],
    inputs: ['disabled', 'tabIndex'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        class: 'kbq-select',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-invalid]': 'errorState',

        '(click)': 'toggle()',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',

        '(window:resize)': 'calculateHiddenItems()'
    },
    animations: [
        kbqSelectAnimations.transformPanel,
        kbqSelectAnimations.fadeInContent
    ],
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqSelect },
        { provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqSelect }
    ]
})
export class KbqSelect extends KbqSelectMixinBase implements
    AfterContentInit, AfterViewInit, OnChanges, OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable,
    HasTabIndex, KbqFormFieldControl<any>, CanUpdateErrorState {

    /** A name for this control that can be used by `kbq-form-field`. */
    controlType = 'select';

    hiddenItems: number = 0;

    /** The last measured value for the trigger's client bounding rect. */
    triggerRect: ClientRect;

    /** The cached font-size of the trigger element. */
    triggerFontSize = 0;

    /** Deals with the selection logic. */
    selectionModel: SelectionModel<KbqOptionBase>;

    previousSelectionModelSelected: KbqOptionBase[] = [];

    /** Manages keyboard events for options in the panel. */
    keyManager: ActiveDescendantKeyManager<KbqOption>;

    /** The value of the select panel's transform-origin property. */
    transformOrigin: string = 'top';

    /** Emits when the panel element is finished transforming in. */
    panelDoneAnimatingStream = new Subject<string>();

    /** Strategy that will be used to handle scrolling while the select panel is open. */
    scrollStrategy = this.scrollStrategyFactory();

    /**
     * The y-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text.
     * when the panel opens. Will change based on the y-position of the selected option.
     */
    offsetY = 2;

    /**
     * This position config ensures that the top "start" corner of the overlay
     * is aligned with with the top "start" of the origin by default (overlapping
     * the trigger completely). If the panel cannot fit below the trigger, it
     * will fall back to a position above the trigger.
     */
    positions: ConnectedPosition[] = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
        },
        {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
        }
    ];

    @ViewChild('trigger', { static: false }) trigger: ElementRef;

    @ViewChild('panel', { static: false }) panel: ElementRef;

    @ViewChild('optionsContainer', { static: false }) optionsContainer: ElementRef;

    @ViewChild(CdkConnectedOverlay, { static: false }) overlayDir: CdkConnectedOverlay;

    @ContentChild(KbqSelectFooter, { static: false, read: ElementRef }) footer?: ElementRef;

    @ContentChild(CdkVirtualForOf, { static: false }) cdkVirtualForOf?: CdkVirtualForOf<any>;

    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;

    /** User-supplied override of the trigger element. */
    @ContentChild(KbqSelectTrigger, { static: false }) customTrigger: KbqSelectTrigger;

    @ContentChild(KbqSelectMatcher, { static: false }) customMatcher: KbqSelectMatcher;

    @ContentChild('kbqSelectTagContent', { static: false, read: TemplateRef }) customTagTemplateRef: TemplateRef<any>;

    @ContentChild('kbqSelectCleaner', { static: true }) cleaner: KbqCleaner;

    /** All of the defined select options. */
    @ContentChildren(KbqOption, { descendants: true }) options: QueryList<KbqOption>;

    /** All of the defined groups of options. */
    @ContentChildren(KbqOptgroup) optionGroups: QueryList<KbqOptgroup>;

    @ContentChild(KbqSelectSearch, { static: false }) search: KbqSelectSearch;

    @Input() hiddenItemsText: string = 'еще {{ number }}';

    /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Function used to sort the values in a select in multiple mode.
     * Follows the same logic as `Array.prototype.sort`.
     */
    @Input() sortComparator: (a: KbqOptionBase, b: KbqOptionBase, options: KbqOptionBase[]) => number;

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<KbqOptionSelectionChange> = defer(() => {
        if (this.options) {
            return merge(
                ...this.options.map((option) => option.onSelectionChange),
                ...this.selectionModel.selected.map((option) => option.onSelectionChange),
                this.options.changes.pipe(
                    switchMap((list: QueryList<KbqOption>) => merge(
                        ...list.map((option) => option.onSelectionChange))
                    )
                )
            );
        }

        return this._ngZone.onStable
            .asObservable()
            .pipe(take(1), switchMap(() => this.optionSelectionChanges));
    }) as Observable<KbqOptionSelectionChange>;

    /** Event emitted when the select panel has been toggled. */
    @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted when the select has been opened. */
    @Output('opened') readonly openedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => o), map(() => {}));

    /** Event emitted when the select has been closed. */
    @Output('closed') readonly closedStream: Observable<void> =
        this.openedChange.pipe(filter((o) => !o), map(() => {}));

    /** Event emitted when the selected value has been changed by the user. */
    @Output() readonly selectionChange: EventEmitter<KbqSelectChange> = new EventEmitter<KbqSelectChange>();

    /**
     * Event that emits whenever the raw value of the select changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    private _hasBackdrop: boolean = false;

    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;

        this.stateChanges.next();
    }

    private _placeholder: string;

    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);

        this.stateChanges.next();
    }

    private _required: boolean = false;

    @Input()
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        if (this.selectionModel) {
            throw getKbqSelectDynamicMultipleError();
        }

        this._multiple = coerceBooleanProperty(value);
    }

    private _multiple: boolean = false;

    /**
     * Function to compare the option values with the selected values. The first argument
     * is a value from an option. The second is a value from the selection. A boolean
     * should be returned.
     */
    @Input()
    get compareWith() {
        return this._compareWith;
    }

    set compareWith(fn: (o1: any, o2: any) => boolean) {
        /* tslint:disable-next-line:strict-type-predicates */
        if (typeof fn !== 'function') {
            throw getKbqSelectNonFunctionValueError();
        }

        this._compareWith = fn;

        if (this.selectionModel) {
            // A different comparator means the selection could change.
            this.initializeSelection();
        }
    }

    /** Value of the select control. */
    @Input()
    get value(): any {
        return this._value;
    }

    set value(newValue: any) {
        if (newValue !== this._value) {
            this.writeValue(newValue);
            this._value = newValue;
        }
    }

    private _value: any;

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
        this.stateChanges.next();
    }

    private _id: string;

    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);

        if (this.parentFormField) {
            this._disabled ? this.parentFormField.stopFocusMonitor() : this.parentFormField.runFocusMonitor();
        }
    }

    private _disabled: boolean = false;

    /** Whether the select is focused. */
    get focused(): boolean {
        return this._focused || this.panelOpen;
    }

    set focused(value: boolean) {
        this._focused = value;
    }

    panelOpen = false;

    private _focused = false;

    private withVirtualScroll: boolean;

    get isEmptySearchResult(): boolean {
        return this.search && this.options.length === 0 && !!this.search.input.value;
    }

    get canShowCleaner(): boolean {
        return !this.disabled && this.cleaner && this.selectionModel.hasValue();
    }

    get selected(): KbqOptionBase | KbqOptionBase[] {
        return this.multiple ? this.selectionModel.selected : this.selectionModel.selected[0];
    }

    get triggerValue(): string {
        if (this.empty) { return ''; }

        return this.selectionModel.selected[0].viewValue;
    }

    get triggerValues(): KbqOptionBase[] {
        if (this.empty) { return []; }

        const selectedOptions = this.selectionModel.selected;

        if (this.isRtl()) { selectedOptions.reverse(); }

        return selectedOptions;
    }

    get empty(): boolean {
        return !this.selectionModel || this.selectionModel.isEmpty();
    }

    get firstSelected(): KbqOptionBase | null {
        return this.selectionModel.selected
            .filter((option) => !option.disabled)[0] || null;
    }

    get firstFiltered(): boolean {
        return !this.options
            .find((option: KbqOption) => option === this.firstSelected);
    }

    private closeSubscription = Subscription.EMPTY;

    /** The scroll position of the overlay panel, calculated to center the selected option. */
    private scrollTop = 0;

    /** Unique id for this input. */
    private readonly uid = `kbq-select-${nextUniqueId++}`;

    private visibleChanges: BehaviorSubject<boolean> = new BehaviorSubject(false);
    /** Emits whenever the component is destroyed. */
    private readonly destroy = new Subject<void>();

    constructor(
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _ngZone: NgZone,
        private readonly _renderer: Renderer2,
        defaultErrorStateMatcher: ErrorStateMatcher,
        elementRef: ElementRef,
        private overlayContainer: OverlayContainer,
        @Optional() private readonly _dir: Directionality,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        @Optional() private readonly parentFormField: KbqFormField,
        @Self() @Optional() ngControl: NgControl,
        @Inject(KBQ_SELECT_SCROLL_STRATEGY) private readonly scrollStrategyFactory,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        super(elementRef, defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

        this.localeService?.changes
            .subscribe(this.updateLocaleParams);

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    ngOnInit() {
        this.selectionModel = new SelectionModel(this.multiple);
        this.stateChanges.next();

        // We need `distinctUntilChanged` here, because some browsers will
        // fire the animation end event twice for the same animation. See:
        // https://github.com/angular/angular/issues/24084
        this.panelDoneAnimatingStream
            .pipe(distinctUntilChanged(), takeUntil(this.destroy))
            .subscribe(() => {
                if (this.panelOpen) {
                    this.scrollTop = 0;

                    if (this.search) { this.search.focus(); }

                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
                    this._changeDetectorRef.markForCheck();
                }
            });

        merge(
            this.optionSelectionChanges,
            this.visibleChanges
        ).pipe(takeUntil(this.destroy), distinctUntilChanged())
            .subscribe(
                () => setTimeout(() => this.calculateHiddenItems(), 0)
            );
    }

    ngAfterContentInit() {
        this.withVirtualScroll = !!this.cdkVirtualForOf;
        this.initKeyManager();

        this.selectionModel.changed
            .pipe(takeUntil(this.destroy))
            .subscribe((event) => {
                event.added.forEach((option) => option.select());
                event.removed.forEach((option) => option.deselect());
            });

        this.options.changes
            .pipe(startWith(null), takeUntil(this.destroy))
            .subscribe(() => {
                this.resetOptions();
                this.initializeSelection();
            });
    }

    ngAfterViewInit(): void {
        this.tags.changes
            .subscribe(() => {
                setTimeout(() => this.calculateHiddenItems(), 0);
            });
    }

    ngDoCheck() {
        this.visibleChanges.next(this.isVisible());

        if (this.ngControl) { this.updateErrorState(); }
    }

    ngOnChanges(changes: SimpleChanges) {
        // Updating the disabled state is handled by `mixinDisabled`, but we need to additionally let
        // the parent form field know to run change detection when the disabled state changes.
        if (changes.disabled) {
            this.stateChanges.next();
        }
    }

    ngOnDestroy() {
        this.destroy.next();
        this.destroy.complete();
        this.stateChanges.complete();
        this.closeSubscription.unsubscribe();
    }

    @Input()
    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return hiddenItemsText.replace('{{ number }}', hiddenItems.toString());
    }

    clearValue($event): void {
        $event.stopPropagation();

        this.selectionModel.clear();
        this.keyManager.setActiveItem(-1);

        this.propagateChanges();
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    resetSearch(): void {
        if (!this.search) { return; }

        this.search.reset();
        /*
        todo the incorrect behaviour of keyManager is possible here
        to avoid first item selection (to provide correct options flipping on closed select)
        we should process options update like it is the first options appearance
        */
        this.search.isSearchChanged = false;
    }

    /** Toggles the overlay panel open or closed. */
    toggle(): void {
        if (this.panelOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /** Opens the overlay panel. */
    open(): void {
        if (this.disabled || !this.options?.length || this.panelOpen) { return; }

        this.triggerRect = this.trigger.nativeElement.getBoundingClientRect();
        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

        this.panelOpen = true;

        this.keyManager.withHorizontalOrientation(null);
        this.highlightCorrectOption();
        this._changeDetectorRef.markForCheck();

        // Set the font size on the panel element once it exists.
        this._ngZone.onStable.asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.scrollActiveOptionIntoView();

                if (this.triggerFontSize && this.overlayDir.overlayRef && this.overlayDir.overlayRef.overlayElement) {
                    this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this.triggerFontSize}px`;
                }

                const overlayContainer = this.overlayContainer.getContainerElement();

                if (overlayContainer.childNodes.length === 1) {
                    this._renderer.addClass(overlayContainer, 'cdk-overlay-container_dropdown');
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (!this.panelOpen) { return; }

        // the order of calls is important
        this.resetSearch();
        this.panelOpen = false;
        this.keyManager.withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');

        this._changeDetectorRef.markForCheck();
        this.onTouched();

        this._renderer.removeClass(this.overlayContainer.getContainerElement(), 'cdk-overlay-container_dropdown');
    }

    /**
     * Sets the select's value. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param value New value to be written to the model.
     */
    writeValue(value: any): void {
        if (this.options) {
            this.setSelectionByValue(value);
        }
    }

    /**
     * Saves a callback function to be invoked when the select's value
     * changes from user input. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the value changes.
     */
    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    /**
     * Saves a callback function to be invoked when the select is blurred
     * by the user. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the component has been touched.
     */
    registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    /**
     * Disables the select. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param isDisabled Sets whether the component is disabled.
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this._changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }

    isRtl(): boolean {
        return this._dir ? this._dir.value === 'rtl' : false;
    }

    handleKeydown(event: KeyboardEvent): void {
        if (this.disabled) { return; }

        if (this.panelOpen) {
            this.handleOpenKeydown(event);
        } else {
            this.handleClosedKeydown(event);
        }
    }

    onFocus() {
        if (!this.disabled) {
            this._focused = true;

            this.stateChanges.next();
        }
    }

    /**
     * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
     * "blur" to the panel when it opens, causing a false positive.
     */
    onBlur() {
        this._focused = false;

        if (!this.disabled && !this.panelOpen) {
            this.onTouched();
            this._changeDetectorRef.markForCheck();
            this.stateChanges.next();

            if (this.ngControl?.control) {
                const control = this.ngControl.control;

                control.updateValueAndValidity({ emitEvent: false });
                (control.statusChanges as EventEmitter<string>).emit(control.status);
            }
        }
    }

    /**
     * Callback that is invoked when the overlay panel has been attached.
     */
    onAttached(): void {
        this.overlayDir.positionChange
            .pipe(take(1))
            .subscribe(() => {
                this._changeDetectorRef.detectChanges();
                this.setOverlayPosition();
                this.optionsContainer.nativeElement.scrollTop = this.scrollTop;

                this.updateScrollSize();
            });

        this.options.changes
            .pipe(delay(1))
            .subscribe(() => this.setOverlayPosition());

        this.closeSubscription = this.closingActions()
            .subscribe(() => this.close());
    }

    /** Returns the theme to be used on the panel. */
    getPanelTheme(): string {
        return this.parentFormField ? `kbq-${this.parentFormField.color}` : '';
    }

    /** Focuses the select element. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /** Invoked when an option is clicked. */
    onRemoveMatcherItem(option: KbqOptionBase, $event): void {
        $event.stopPropagation();

        option.deselect();
    }

    calculateHiddenItems(): void {
        if (this.customTrigger || this.empty || !this.multiple) { return; }

        const totalItemsWidth = this.getTotalItemsWidthInMatcher();
        const [totalVisibleItemsWidth, visibleItems] = this.getTotalVisibleItems();

        this.hiddenItems = (this.selected as ArrayLike<KbqOptionBase>).length - visibleItems;
        this._changeDetectorRef.detectChanges();

        if (this.hiddenItems) {
            const itemsCounter = this.trigger.nativeElement.querySelector('.kbq-select__match-hidden-text');
            const matcherList = this.trigger.nativeElement.querySelector('.kbq-select__match-list');

            const itemsCounterShowed = itemsCounter.offsetTop < itemsCounter.offsetHeight;
            const itemsCounterWidth: number = Math.floor(itemsCounter.getBoundingClientRect().width);

            const matcherListWidth: number = Math.floor(matcherList.getBoundingClientRect().width);
            const matcherWidth: number = matcherListWidth + (itemsCounterShowed ? itemsCounterWidth : 0);

            if (itemsCounterShowed && (totalItemsWidth < matcherWidth)) {
                this.hiddenItems = 0;
                this._changeDetectorRef.detectChanges();
            }

            if (
                totalVisibleItemsWidth === matcherListWidth ||
                (totalVisibleItemsWidth + itemsCounterWidth) < matcherListWidth
            ) {
                this._changeDetectorRef.markForCheck();

                return;
            }
        }

        this._changeDetectorRef.markForCheck();
    }

    getItemHeight(): number {
        return this.options.first ? this.options.first.getHeight() : 0;
    }

    handleClick($event: MouseEvent) {
        if (this.footer?.nativeElement.contains($event.target)) {
            this.close();
        }
    }

    private updateLocaleParams = () => {
        this.hiddenItemsText = this.localeService?.getParams('select').hiddenItemsText;

        this._changeDetectorRef.markForCheck();
    }

    private isVisible(): boolean {
        return this.elementRef.nativeElement.offsetTop < this.elementRef.nativeElement.offsetHeight;
    }

    private currentOverlayPosition(): number {
        const element = this.overlayDir.overlayRef.hostElement

        return Array.from(this.overlayContainer.getContainerElement().childNodes)
            .findIndex((node) => {
                return ((node as HTMLElement).firstChild as HTMLElement).id == (element.firstChild as HTMLElement).id;
            });
    }

    private modalOverlayPosition(): number {
        return Array.from(this.overlayContainer.getContainerElement().childNodes)
            .findIndex((childNode) => (childNode as HTMLElement).classList.contains('kbq-modal-overlay'));
    }

    private closingActions() {

        // used for calling toggle on select from outside of component
        const outsidePointerEvents = this.overlayDir.overlayRef!.outsidePointerEvents()
            .pipe(delay(0))
            .pipe(filter(() => {
                if (this.overlayContainer.getContainerElement().childElementCount > 1) {
                    return this.currentOverlayPosition() > this.modalOverlayPosition();
                }

                return true;
            }));

        return merge(
            outsidePointerEvents,
            this.overlayDir.overlayRef!.detachments()
        );
    }

    private getHeightOfOptionsContainer(): number {
        return this.optionsContainer.nativeElement.getClientRects()[0].height;
    }

    private updateScrollSize(): void {
        if (!this.options.first) { return; }

        this.keyManager.withScrollSize(
            Math.floor(this.getHeightOfOptionsContainer() / this.options.first.getHeight())
        );
    }

    private getTotalItemsWidthInMatcher(): number {
        const triggerClone = this.buildTriggerClone();
        triggerClone.querySelector('.kbq-select__match-hidden-text')?.remove();
        this._renderer.appendChild(this.trigger.nativeElement, triggerClone);

        let totalItemsWidth: number = 0;
        (triggerClone.querySelectorAll('kbq-tag') as NodeListOf<HTMLElement>)
            .forEach((item) => totalItemsWidth += this.getItemWidth(item));

        triggerClone.remove();

        return totalItemsWidth;
    }

    private getItemWidth(element: HTMLElement): number {
        const computedStyle = window.getComputedStyle(element);

        const width: number = parseInt(computedStyle.width as string);
        const marginLeft: number = parseInt(computedStyle.marginLeft as string);
        const marginRight: number = parseInt(computedStyle.marginRight as string);

        return width + marginLeft + marginRight;
    }

    /** Handles keyboard events while the select is closed. */
    private handleClosedKeydown(event: KeyboardEvent): void {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = [DOWN_ARROW, UP_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode);
        const isOpenKey = [ENTER, SPACE].includes(keyCode);

        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || ((this.multiple || event.altKey) && isArrowKey)) {
            event.preventDefault(); // prevents the page from scrolling down when pressing space
            this.open();
        } else if (!this.multiple) {
            this.keyManager.onKeydown(event);
        }
    }

    /** Handles keyboard events when the selected is open. */
    private handleOpenKeydown(event: KeyboardEvent): void {
        /* tslint:disable-next-line */
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;

        if (isArrowKey && event.altKey || keyCode === ESCAPE || keyCode === TAB) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();
            this.close();
            this.focus();
        } else if (keyCode === HOME) {
            event.preventDefault();

            this.keyManager.setFirstItemActive();
        } else if (keyCode === END) {
            event.preventDefault();

            this.keyManager.setLastItemActive();
        } else if (keyCode === PAGE_UP) {
            event.preventDefault();

            this.keyManager.setPreviousPageItemActive();
        } else if (keyCode === PAGE_DOWN) {
            event.preventDefault();

            this.keyManager.setNextPageItemActive();
        } else if ((keyCode === ENTER || keyCode === SPACE) && this.keyManager.activeItem) {
            event.preventDefault();
            this.keyManager.activeItem.selectViaInteraction();
        } else if (this._multiple && keyCode === A && event.ctrlKey) {
            event.preventDefault();
            const hasDeselectedOptions = this.options.some((option) => !option.selected);
            this.options.forEach((option) => {
                if (hasDeselectedOptions && !option.disabled) {
                    option.select();
                } else {
                    option.deselect();
                }
            });
        } else {
            const previouslyFocusedIndex = this.keyManager.activeItemIndex;

            this.keyManager.onKeydown(event);

            if (this._multiple && isArrowKey && event.shiftKey && this.keyManager.activeItem &&
                this.keyManager.activeItemIndex !== previouslyFocusedIndex) {
                this.keyManager.activeItem.selectViaInteraction();
            }

            if (this.search) {
                this.search.focus();
            }

            if (this.search && (this.keyManager.isTyping() || [BACKSPACE, DELETE].includes(keyCode))) {
                setTimeout(() => this.highlightCorrectOption());
            }
        }
    }

    private initializeSelection(): void {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            this.setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
        });
    }

    /**
     * Sets the selected option based on a value. If no option can be
     * found with the designated value, the select trigger is cleared.
     */
    private setSelectionByValue(value: any | any[]): void {
        this.previousSelectionModelSelected = this.selectionModel.selected;

        if (this.multiple && value) {
            if (!Array.isArray(value)) {
                throw getKbqSelectNonArrayValueError();
            }

            this.selectionModel.clear();
            value.forEach((currentValue: any) => this.selectValue(currentValue));
            this.sortValues();
        } else {
            this.selectionModel.clear();
            const correspondingOption = this.selectValue(value);

            // Shift focus to the active item. Note that we shouldn't do this in multiple
            // mode, because we don't know what option the user interacted with last.
            if (correspondingOption) {
                this.keyManager.setActiveItem(correspondingOption);
            }
        }

        this._changeDetectorRef.markForCheck();
    }

    private getCorrespondOption(value: any): KbqOptionBase | undefined {
        return [
            ...this.options.toArray(),
            ...this.previousSelectionModelSelected
        ].find((option: KbqOptionBase) => {
            try {
                // Treat null as a special reset value.
                return option.value != null && this.compareWith(option.value, value);
            } catch (error) {
                if (isDevMode()) {
                    // Notify developers of errors in their comparator.
                    console.warn(error);
                }

                return false;
            }
        });
    }

    /**
     * Finds and selects and option based on its value.
     * @returns Option that has the corresponding value.
     */
    private selectValue(value: any): KbqOption | undefined {
        const correspondingOption = this.getCorrespondOption(value);

        if (correspondingOption) {
            this.selectionModel.select(correspondingOption);
        } else if (this.withVirtualScroll) {
            const source = this.cdkVirtualForOf?.cdkVirtualForOf;
            const correspondingOptionVirtual = source instanceof Array
                ? source.find((item) => this.compareWith(item, value))
                : undefined;

            if (correspondingOptionVirtual) {
                const kbqVirtualOption = new KbqVirtualOption(correspondingOptionVirtual, this.disabled);

                this.selectionModel.select(kbqVirtualOption);
            }
        }

        return correspondingOption as KbqOption;
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private initKeyManager() {
        const typeAheadDebounce = 200;

        this.keyManager = new ActiveDescendantKeyManager<KbqOption>(this.options)
            .withTypeAhead(typeAheadDebounce, this.search ? -1 : 0)
            .withVerticalOrientation()
            .withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');

        this.keyManager.change
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                if (this.panelOpen && this.panel) {
                    this.scrollActiveOptionIntoView();
                } else if (!this.panelOpen && !this.multiple && this.keyManager.activeItem) {
                    this.keyManager.activeItem.selectViaInteraction();
                }
            });
    }

    /** Drops current option subscriptions and IDs and resets from scratch. */
    private resetOptions(): void {
        const changedOrDestroyed = merge(this.options.changes, this.destroy);

        this.optionSelectionChanges
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe((event) => {
                this.onSelect(event.source, event.isUserInput);

                if (this.search && this.search.isSearchChanged) {
                    Promise.resolve().then(() => this.keyManager.updateActiveItem(0));

                    this.search.isSearchChanged = false;
                }

                if (event.isUserInput && !this.multiple && this.panelOpen) {
                    this.close();
                    this.focus();
                }
            });

        // Listen to changes in the internal state of the options and react accordingly.
        // Handles cases like the labels of the selected options changing.
        merge(...this.options.map((option) => option.stateChanges))
            .pipe(takeUntil(changedOrDestroyed))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
                this.stateChanges.next();
            });
    }

    /** Invoked when an option is clicked. */
    private onSelect(option: KbqOption, isUserInput: boolean): void {
        const wasSelected = this.selectionModel.isSelected(option);

        if (option.value == null && !this._multiple) {
            option.deselect();
            this.selectionModel.clear();
            this.propagateChanges(option.value);
        } else {
            if (option.selected) {
                this.selectionModel.select(option);
            } else {
                this.selectionModel.deselect(option);
            }

            if (isUserInput) {
                this.keyManager.setActiveItem(option);
            }

            if (this.multiple) {
                this.sortValues();

                if (isUserInput) {
                    // In case the user selected the option with their mouse, we
                    // want to restore focus back to the trigger, in order to
                    // prevent the select keyboard controls from clashing with
                    // the ones from `kbq-option`.
                    // If search is avaliable then we focus search again.
                    if (this.search) {
                        this.search.focus();
                    } else {
                        this.focus();
                    }
                }
            }
        }

        if (wasSelected !== this.selectionModel.isSelected(option)) {
            this.propagateChanges();
        }

        this.stateChanges.next();
    }

    /** Sorts the selected values in the selected based on their order in the panel. */
    private sortValues() {
        if (this.multiple) {
            const options = this.options.toArray();

            this.selectionModel.sort((a, b) => this.sortComparator ?
                this.sortComparator(a, b, options) :
                a.value - b.value
            );
            this.stateChanges.next();
        }
    }

    /** Emits change event to set the model value. */
    private propagateChanges(fallbackValue?: any): void {
        let valueToEmit: any;

        if (this.multiple) {
            valueToEmit = (this.selected as KbqOption[]).map((option) => option.value);
        } else {
            valueToEmit = this.selected ? (this.selected as KbqOption).value : fallbackValue;
        }

        this._value = valueToEmit;
        this.valueChange.emit(valueToEmit);
        this.onChange(valueToEmit);
        this.selectionChange.emit(new KbqSelectChange(this, valueToEmit));
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Highlights the selected item. If no option is selected, it will highlight
     * the first item instead.
     */
    private highlightCorrectOption(): void {
        if (this.keyManager) {
            if (this.empty || !this.firstSelected || this.firstFiltered) {
                this.keyManager.setFirstItemActive();
            } else {
                this.keyManager.setActiveItem(this.firstSelected as KbqOption);
            }
        }
    }

    /** Scrolls the active option into view. */
    private scrollActiveOptionIntoView(): void {
        this.keyManager.activeItem?.focus();
    }

    /**
     * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text when
     * the panel opens. Will change based on LTR or RTL text direction. Note that the offset
     * can't be calculated until the panel has been attached, because we need to know the
     * content width in order to constrain the panel within the viewport.
     */
    private setOverlayPosition(): void {
        this.resetOverlay();

        const overlayRect = this.getOverlayRect();
        // Window width without scrollbar
        const windowWidth = this.getOverlayWidth();
        const isRtl = this.isRtl();
        /* tslint:disable-next-line:no-magic-numbers */
        const paddingWidth = SELECT_PANEL_PADDING_X * 2;
        let offsetX: number = SELECT_PANEL_PADDING_X;
        let overlayMaxWidth: number;


        // Invert the offset in LTR.
        if (!isRtl) { offsetX *= -1; }

        // Determine if select overflows on either side.
        const leftOverflow = 0 - (overlayRect.left + offsetX - (isRtl ? paddingWidth : 0));
        const rightOverflow = overlayRect.right + offsetX - windowWidth
            + (isRtl ? 0 : paddingWidth);

        // If the element overflows on either side, reduce the offset to allow it to fit.
        if (leftOverflow > 0 || rightOverflow > 0) {
            [offsetX, overlayMaxWidth] = this.calculateOverlayXPosition(overlayRect, windowWidth, offsetX);
            this.overlayDir.overlayRef.overlayElement.style.maxWidth = `${overlayMaxWidth}px`;
        }

        // Set the offset directly in order to avoid having to go through change detection and
        // potentially triggering "changed after it was checked" errors. Round the value to avoid
        // blurry content in some browsers.
        this.overlayDir.offsetX = Math.round(offsetX);
        this.overlayDir.overlayRef.updatePosition();
    }

    private calculateOverlayXPosition(overlayRect, windowWidth, basicOffsetX) {
        let offsetX = basicOffsetX;
        const leftIndent = this.triggerRect.left;
        const rightIndent = windowWidth - this.triggerRect.right;
        // Setting direction of dropdown expansion
        const isRightDirection = leftIndent <= rightIndent;

        let maxDropdownWidth: number;
        let overlayMaxWidth: number;
        const triggerWidth = this.triggerRect.width + SELECT_PANEL_INDENT_PADDING_X;

        if (isRightDirection) {
            maxDropdownWidth = rightIndent + triggerWidth - SELECT_PANEL_VIEWPORT_PADDING;
            overlayMaxWidth = overlayRect.width < maxDropdownWidth ? overlayRect.width : maxDropdownWidth;
        } else {
            let leftOffset;
            maxDropdownWidth = leftIndent + triggerWidth - SELECT_PANEL_VIEWPORT_PADDING;

            if (overlayRect.width < maxDropdownWidth) {
                overlayMaxWidth = overlayRect.width;
                leftOffset = this.triggerRect.right - overlayMaxWidth;
            } else {
                overlayMaxWidth = maxDropdownWidth;
                leftOffset = this.triggerRect.right - (overlayMaxWidth - SELECT_PANEL_INDENT_PADDING_X);
            }
            offsetX -= this.triggerRect.left - leftOffset;
        }

        return [offsetX, overlayMaxWidth];
    }

    private resetOverlay() {
        this.overlayDir.overlayRef.hostElement.classList.add('kbq-select-overlay');
        this.overlayDir.offsetX = 0;
        this.overlayDir.overlayRef.overlayElement.style.maxWidth = 'unset';
        this.overlayDir.overlayRef.updatePosition();
    }

    private getOverlayRect() {
        return this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
    }

    private getOverlayWidth() {
        return this.scrollStrategy._overlayRef.hostElement.clientWidth;
    }

    /** Comparison function to specify which option is displayed. Defaults to object equality. */
    private _compareWith = (o1: any, o2: any) => o1 === o2;

    private getTotalVisibleItems(): [number, number] {
        const triggerClone = this.buildTriggerClone();
        this._renderer.setStyle(
            triggerClone.querySelector('.kbq-select__match-hidden-text'),
            'display',
            'block'
        );
        this._renderer.appendChild(this.trigger.nativeElement, triggerClone);

        let visibleItemsCount: number = 0;
        let totalVisibleItemsWidth: number = 0;
        (triggerClone.querySelectorAll('kbq-tag') as NodeListOf<HTMLElement>)
            .forEach((item) => {
                if (item.offsetTop < item.offsetHeight) {
                    totalVisibleItemsWidth += this.getItemWidth(item);
                    visibleItemsCount++;
                }
            });

        triggerClone.remove();

        return [totalVisibleItemsWidth, visibleItemsCount];

    }

    private buildTriggerClone(): HTMLDivElement {
        const triggerClone = this.trigger.nativeElement.cloneNode(true);

        this._renderer.setStyle(triggerClone, 'position', 'absolute');
        this._renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this._renderer.setStyle(triggerClone, 'top', '-100%');
        this._renderer.setStyle(triggerClone, 'left', '0');

        return triggerClone;
    }
}
