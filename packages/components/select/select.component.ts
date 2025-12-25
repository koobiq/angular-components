import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition, OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { CdkVirtualForOf } from '@angular/cdk/scrolling';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    DoCheck,
    ElementRef,
    EventEmitter,
    Host,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Provider,
    QueryList,
    Renderer2,
    Self,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
    afterNextRender,
    booleanAttribute,
    inject,
    isDevMode,
    numberAttribute
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import { ActiveDescendantKeyManager } from '@koobiq/cdk/a11y';
import {
    A,
    BACKSPACE,
    DELETE,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    HOME,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/cdk/keycodes';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_LOCALE_SERVICE,
    KBQ_OPTION_PARENT_COMPONENT,
    KBQ_PARENT_POPUP,
    KBQ_SELECT_SCROLL_STRATEGY,
    KBQ_WINDOW,
    KbqAbstractSelect,
    KbqComponentColors,
    KbqLocaleService,
    KbqOptgroup,
    KbqOption,
    KbqOptionBase,
    KbqOptionSelectionChange,
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectTrigger,
    KbqVirtualOption,
    defaultOffsetY,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    getKbqSelectNonFunctionValueError,
    isUndefined,
    kbqSelectAnimations
} from '@koobiq/components/core';
import { KbqCleaner, KbqFormField, KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTag } from '@koobiq/components/tags';
import { SizeXxs as SelectSizeMultipleContentGap } from '@koobiq/design-tokens';
import { BehaviorSubject, Observable, Subject, Subscription, defer, fromEvent, merge } from 'rxjs';
import {
    debounceTime,
    delay,
    distinctUntilChanged,
    filter,
    map,
    startWith,
    switchMap,
    take,
    takeUntil
} from 'rxjs/operators';

let nextUniqueId = 0;

/** Change event object that is emitted when the select value has changed. */
export class KbqSelectChange {
    constructor(
        public source: KbqSelect,
        public value: any
    ) {}
}

/** Select panel width type. */
export type KbqSelectPanelWidth = 'auto' | number | null;

/** Options for the `kbq-select` that can be configured using the `KBQ_SELECT_OPTIONS` injection token. */
export type KbqSelectOptions = Partial<{
    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width.
     * If set to null or an empty string, the panel will grow to match the longest option's text.
     */
    panelWidth: KbqSelectPanelWidth;
    /**
     * Minimum width of the panel. If minWidth is larger than window width or property set to null, it will be ignored.
     */
    panelMinWidth: Exclude<KbqSelectPanelWidth, 'auto'>;
    /**
     * Whether to enable hiding search by default if options is less than minimum.
     *
     * - `'auto'` uses `KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD` as min value.
     * - number - will enables search hiding and uses value as min.
     * @see KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD
     */
    searchMinOptionsThreshold: 'auto' | number;
}>;

/** Injection token that can be used to provide the default options for the `kbq-select`. */
export const KBQ_SELECT_OPTIONS = new InjectionToken<KbqSelectOptions>('KBQ_SELECT_OPTIONS');

/** Utility provider for `KBQ_SELECT_OPTIONS`. */
export const kbqSelectOptionsProvider = (options: KbqSelectOptions): Provider => {
    return {
        provide: KBQ_SELECT_OPTIONS,
        useValue: options
    };
};

@Component({
    selector: 'kbq-select',
    imports: [
        CdkOverlayOrigin,
        KbqTag,
        NgTemplateOutlet,
        CdkMonitorFocus,
        CdkConnectedOverlay,
        NgClass,
        KbqIconModule
    ],
    templateUrl: 'select.html',
    styleUrls: ['./select.scss', './select-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqSelect',
    host: {
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        class: 'kbq-select',
        '[class.kbq-select_multiple]': 'multiple',
        '[class.kbq-select_multiline]': 'multiline',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-invalid]': 'errorState',
        '(click)': 'toggle()',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    },
    animations: [
        kbqSelectAnimations.transformPanel,
        kbqSelectAnimations.fadeInContent
    ],
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqSelect },
        { provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqSelect },
        { provide: KBQ_PARENT_POPUP, useExisting: KbqSelect }
    ]
})
export class KbqSelect
    extends KbqAbstractSelect
    implements
        AfterContentInit,
        OnDestroy,
        OnInit,
        DoCheck,
        ControlValueAccessor,
        KbqFormFieldControl<any>,
        CanUpdateErrorState
{
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);

    protected readonly isBrowser = inject(Platform).isBrowser;

    protected readonly defaultOptions = inject(KBQ_SELECT_OPTIONS, { optional: true });

    private readonly window = inject(KBQ_WINDOW);

    /** Whether the component is in an error state. */
    errorState: boolean = false;
    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     * @docs-private
     */
    readonly stateChanges = new Subject<void>();

    /** A name for this control that can be used by `kbq-form-field`. */
    controlType = 'select';

    hiddenItems: number = 0;

    /** The last measured value for the trigger's client bounding rect. */
    triggerRect: DOMRect;

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
    offsetY = defaultOffsetY;

    /**
     * This position config ensures that the top "start" corner of the overlay
     * is aligned with the top "start" of the origin by default (overlapping
     * the trigger completely). If the panel cannot fit below the trigger, it
     * will fall back to a position above the trigger.
     */
    positions: ConnectedPosition[] = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: this.offsetY
        },
        {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetY: -this.offsetY
        }
    ];

    /**
     * Trigger - is a clickable field to open select dropdown panel
     */
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

    @Input() hiddenItemsText: string = '+{{ number }}';

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

    /**
     * Whether to use a multiline matcher or not. Default is false
     */
    @Input({ transform: booleanAttribute }) multiline: boolean = false;
    /**
     * Controls when the search functionality is displayed based on the number of available options.
     *
     * Automatically enables search hiding if value provided, even if `defaultOptions.minOptionsThreshold` is provided.
     * @default undefined
     */
    @Input() set searchMinOptionsThreshold(value: 'auto' | number | undefined) {
        this._searchMinOptionsThreshold =
            this.resolveSearchMinOptionsThreshold(value) ??
            this.resolveSearchMinOptionsThreshold(this.defaultOptions?.searchMinOptionsThreshold);
    }

    get searchMinOptionsThreshold(): number | undefined {
        return this._searchMinOptionsThreshold;
    }

    private _searchMinOptionsThreshold = this.resolveSearchMinOptionsThreshold(
        this.defaultOptions?.searchMinOptionsThreshold
    );

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<KbqOptionSelectionChange> = defer(() => {
        if (this.options) {
            return merge(
                ...this.options.map((option) => option.onSelectionChange),
                ...this.selectionModel.selected.map((option) => option.onSelectionChange),
                this.options.changes.pipe(
                    switchMap((list: QueryList<KbqOption>) => merge(...list.map((option) => option.onSelectionChange)))
                )
            );
        }

        return this._ngZone.onStable.asObservable().pipe(
            take(1),
            switchMap(() => this.optionSelectionChanges)
        );
    }) as Observable<KbqOptionSelectionChange>;

    /** Event emitted when the select panel has been toggled. */
    @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted when the select has been opened. */
    @Output('opened') readonly openedStream: Observable<void> = this.openedChange.pipe(
        filter((o) => o),
        map(() => {})
    );

    /** Event emitted when the select has been closed. */
    @Output('closed') readonly closedStream: Observable<void> = this.openedChange.pipe(
        filter((o) => !o),
        map(() => {})
    );

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

    @Input({ transform: booleanAttribute })
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        if (this.selectionModel) {
            throw getKbqSelectDynamicMultipleError();
        }

        this._multiple = value;
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
        if (typeof fn !== 'function') {
            throw getKbqSelectNonFunctionValueError();
        }

        this._compareWith = fn;

        if (this.selectionModel) {
            // A different comparator means the selection could change.
            this.initializeSelection();
        }
    }

    /**
     * Function for handling the combination Ctrl + A (select all). By default, the internal handler is used.
     */
    @Input()
    get selectAllHandler() {
        return this._selectAllHandler;
    }

    set selectAllHandler(fn: (event: KeyboardEvent, select: KbqSelect) => void) {
        if (typeof fn !== 'function') {
            throw Error('`selectAllHandler` must be a function.');
        }

        this._selectAllHandler = fn;
    }

    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width.
     * If set to null or an empty string, the panel will grow to match the longest option's text.
     */
    @Input() panelWidth: KbqSelectPanelWidth = this.defaultOptions?.panelWidth || null;

    /**
     * Minimum width of the panel.
     * If minWidth is larger than window width, it will be ignored.
     */
    @Input({ transform: numberAttribute }) panelMinWidth: Exclude<KbqSelectPanelWidth, 'auto'> =
        this.defaultOptions?.panelMinWidth ?? 200;

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

    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;

            if (this.parentFormField) {
                Promise.resolve().then(() => {
                    this._disabled ? this.parentFormField.stopFocusMonitor() : this.parentFormField.runFocusMonitor();
                });
            }

            // Let the parent form field know to run change detection when the disabled state changes.
            this.stateChanges.next();
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
        return this.search && this.options.filter((option) => option.selectable).length === 0 && !!this.search.value();
    }

    get canShowCleaner(): boolean {
        return !this.disabled && this.cleaner && this.selectionModel.hasValue();
    }

    get selected(): KbqOptionBase | KbqOptionBase[] {
        return this.multiSelection ? this.selectionModel.selected : this.selectionModel.selected[0];
    }

    get triggerValue(): string {
        if (this.empty) {
            return '';
        }

        return this.selectionModel.selected[0].viewValue;
    }

    get triggerValues(): KbqOptionBase[] {
        if (this.empty) {
            return [];
        }

        const selectedOptions = this.selectionModel.selected;

        if (this.isRtl()) {
            selectedOptions.reverse();
        }

        return selectedOptions;
    }

    get empty(): boolean {
        return !!this.selectionModel?.isEmpty();
    }

    get firstSelected(): KbqOptionBase | null {
        return this.selectionModel.selected.filter((option) => !option.disabled)[0] || null;
    }

    get firstFiltered(): boolean {
        return !this.options.find((option: KbqOption) => option === this.firstSelected);
    }

    /** @docs-private */
    get colorForState(): KbqComponentColors {
        const hasLegacyValidateDirective = this.elementRef.nativeElement.classList.contains(
            'kbq-control_has-validate-directive'
        );

        // @TODO fix disabled state color (#DS-4574)
        return (hasLegacyValidateDirective && this.ngControl?.invalid) || this.errorState
            ? KbqComponentColors.Error
            : KbqComponentColors.ContrastFade;
    }

    /** Whether multiple choice is enabled or not. True if multiple or multiline */
    get multiSelection(): boolean {
        return this.multiple || this.multiline;
    }

    private closeSubscription = Subscription.EMPTY;

    /** The scroll position of the overlay panel, calculated to center the selected option. */
    private scrollTop = 0;

    /** Unique id for this input. */
    private readonly uid = `kbq-select-${nextUniqueId++}`;

    private visibleChanges: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /** Width of the overlay panel. */
    protected overlayWidth: string | number;

    /** Min width of the overlay panel. */
    protected overlayMinWidth: string | number;

    /** Origin for the overlay panel. */
    protected overlayOrigin?: CdkOverlayOrigin | ElementRef;

    constructor(
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _ngZone: NgZone,
        private readonly _renderer: Renderer2,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public elementRef: ElementRef<HTMLElement>,
        private overlayContainer: OverlayContainer,
        @Optional() private readonly _dir: Directionality,
        @Optional() public parentForm: NgForm,
        @Optional() public parentFormGroup: FormGroupDirective,
        @Host() @Optional() private readonly parentFormField: KbqFormField,
        @Self() @Optional() public ngControl: NgControl,
        @Inject(KBQ_SELECT_SCROLL_STRATEGY) private readonly scrollStrategyFactory,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) protected localeService?: KbqLocaleService
    ) {
        super();

        this.localeService?.changes.subscribe(this.updateLocaleParams);

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        afterNextRender(() => {
            if (this.multiple && !this.multiline) {
                merge(fromEvent(this.window, 'resize'), this.tags.changes)
                    .pipe(delay(0), debounceTime(50), takeUntilDestroyed(this.destroyRef))
                    .subscribe(this.calculateHiddenItems);
            }
        });
    }

    ngOnInit() {
        this.selectionModel = new SelectionModel(this.multiSelection);
        this.stateChanges.next();

        // We need `distinctUntilChanged` here, because some browsers will
        // fire the animation end event twice for the same animation. See:
        // https://github.com/angular/angular/issues/24084
        this.panelDoneAnimatingStream
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                if (this.panelOpen) {
                    this.scrollTop = 0;

                    if (this.search) {
                        this.search.focus();
                    }

                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
                    this._changeDetectorRef.markForCheck();
                }
            });

        merge(this.optionSelectionChanges, this.visibleChanges)
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe(() =>
                setTimeout(() => {
                    this.calculateHiddenItems();

                    if (this.multiline) {
                        this.setOverlayPosition();
                    }
                }, 0)
            );
    }

    ngDoCheck() {
        this.visibleChanges.next(this.isVisible());

        if (this.ngControl) {
            this.updateErrorState();
        }
    }

    ngAfterContentInit() {
        this.withVirtualScroll = !!this.cdkVirtualForOf;
        this.initKeyManager();

        this.selectionModel.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
            event.added.forEach((option) => option.select());
            event.removed.forEach((option) => option.deselect());
        });

        this.options.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.resetOptions();
            this.initializeSelection();
        });

        this.search?.changes
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                delay(0),
                filter(() => !this.keyManager.activeItem)
            )
            .subscribe(() => this.keyManager.updateActiveItem(0));
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.closeSubscription.unsubscribe();
    }

    updateErrorState() {
        const oldState = this.errorState;
        const parent = this.parentFormGroup || this.parentForm;
        const matcher = this.errorStateMatcher || this.defaultErrorStateMatcher;
        const control = this.ngControl ? (this.ngControl.control as UntypedFormControl) : null;
        const newState = matcher.isErrorState(control, parent);

        if (newState !== oldState) {
            this.errorState = newState;
            this.stateChanges.next();
        }
    }

    @Input()
    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return hiddenItemsText.replace('{{ number }}', hiddenItems.toString());
    }

    clearValue($event): void {
        // need to prevent opening
        $event.stopPropagation();
        // need to prevent scrolling
        $event.preventDefault();

        this.selectionModel.clear();
        this.keyManager.setActiveItem(-1);

        this.propagateChanges();

        this.focus();
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    resetSearch(): void {
        if (!this.search) {
            return;
        }

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
        if (this.disabled || !this.options?.length || this.panelOpen) {
            return;
        }

        // add check for form-field bounding rectangles, since it adds extra padding around the trigger
        this.triggerRect = (
            this.parentFormField?.getConnectedOverlayOrigin().nativeElement || this.trigger.nativeElement
        ).getBoundingClientRect();

        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(this.window.getComputedStyle(this.trigger.nativeElement)['font-size']);

        // It's important that we read this as late as possible, because doing so earlier will
        // return a different element since it's based on queries in the form field which may
        // not have run yet. Also this needs to be assigned before we measure the overlay width.
        if (this.parentFormField) {
            this.overlayOrigin = this.parentFormField.getConnectedOverlayOrigin();
        }

        this.overlayWidth = this.getOverlayWidth(this.overlayOrigin);

        // set overlayMinWidth to the largest of `panelMinWidth` and `triggerRect.width`
        // only if `overlayWidth` falsy and `panelMinWidth` not provided.
        // This ensures panel isn't narrow.
        this.overlayMinWidth =
            this.panelMinWidth !== null && !this.overlayWidth
                ? Math.max(this.panelMinWidth, this.triggerRect.width)
                : '';

        this.panelOpen = true;

        this.keyManager.withHorizontalOrientation(null);
        this.highlightCorrectOption();
        this._changeDetectorRef.markForCheck();

        // Set the font size on the panel element once it exists.
        this._ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.scrollActiveOptionIntoView();

                if (this.triggerFontSize && this.overlayDir.overlayRef && this.overlayDir.overlayRef.overlayElement) {
                    this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this.triggerFontSize}px`;
                }

                const overlayContainer = this.overlayContainer?.getContainerElement();

                if (overlayContainer.childNodes.length === 1) {
                    this._renderer.addClass(overlayContainer, 'cdk-overlay-container_dropdown');
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (!this.panelOpen) {
            return;
        }

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
    // eslint-disable-next-line @typescript-eslint/ban-types
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
        if (this.disabled) {
            return;
        }

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
        this.overlayDir.positionChange.pipe(take(1)).subscribe(() => {
            this._changeDetectorRef.detectChanges();
            this.setOverlayPosition();
            this.optionsContainer.nativeElement.scrollTop = this.scrollTop;

            this.updateScrollSize();
        });

        this.options.changes.pipe(delay(1)).subscribe(() => this.setOverlayPosition());

        this.closeSubscription = this.closingActions().subscribe(() => this.close());
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

    calculateHiddenItems = () => {
        if (
            !this.isBrowser ||
            this.customTrigger ||
            this.customMatcher ||
            this.empty ||
            !this.multiple ||
            this.multiline
        )
            return;

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

            if (itemsCounterShowed && totalItemsWidth < matcherWidth) {
                this.hiddenItems = 0;
                this._changeDetectorRef.detectChanges();
            }

            if (
                totalVisibleItemsWidth === matcherListWidth ||
                totalVisibleItemsWidth + itemsCounterWidth < matcherListWidth
            ) {
                this._changeDetectorRef.markForCheck();

                return;
            }
        }

        this._changeDetectorRef.markForCheck();
    };

    getItemHeight(): number {
        return this.options.first ? this.options.first.getHeight() : 0;
    }

    handleClick($event: MouseEvent) {
        if (this.footer?.nativeElement.contains($event.target)) {
            this.close();
        }
    }

    /** @docs-private */
    setSelectedOptionsByClick(option: KbqOption) {
        if (this.multiple || this.multiline) {
            this.keyManager.setActiveItem(option);
            const options = this.options.toArray();

            let fromIndex = this.keyManager.previousActiveItemIndex;
            let toIndex = (this.keyManager.previousActiveItemIndex = this.keyManager.activeItemIndex);
            const selectedOptionState = options[fromIndex].selected;

            if (toIndex === fromIndex) {
                this.selectionModel.toggle(option);

                return;
            }

            if (fromIndex > toIndex) {
                [fromIndex, toIndex] = [toIndex, fromIndex];
            }

            options
                .slice(fromIndex, toIndex + 1)
                .filter((item) => !item.disabled)
                .forEach((option) => {
                    if (selectedOptionState) {
                        option.select();
                    } else {
                        option.deselect();
                    }
                });
        } else {
            this.selectionModel.toggle(option);
        }
    }

    /** @docs-private */
    protected shouldShowSearch(): boolean {
        return isUndefined(this.searchMinOptionsThreshold) || this.options.length >= this.searchMinOptionsThreshold;
    }

    private updateLocaleParams = () => {
        this.hiddenItemsText = this.localeService?.getParams('select').hiddenItemsText;

        this._changeDetectorRef.markForCheck();
    };

    private isVisible(): boolean {
        return this.elementRef.nativeElement.offsetTop < this.elementRef.nativeElement.offsetHeight;
    }

    private currentOverlayPosition(): number {
        const element = this.overlayDir.overlayRef.hostElement;

        return Array.from(this.overlayContainer.getContainerElement().childNodes).findIndex((node) => {
            return node.firstChild?.['id'] === element.firstChild?.['id'];
        });
    }

    private modalOverlayPosition(): number {
        return Array.from(this.overlayContainer.getContainerElement().childNodes).findIndex((childNode) =>
            (childNode as HTMLElement).classList.contains('kbq-modal-overlay')
        );
    }

    private closingActions() {
        // used for calling toggle on select from outside of component
        const outsidePointerEvents = this.overlayDir
            .overlayRef!.outsidePointerEvents()
            .pipe(delay(0))
            .pipe(
                filter(() => {
                    if (this.overlayContainer.getContainerElement().childElementCount > 1) {
                        return this.currentOverlayPosition() > this.modalOverlayPosition();
                    }

                    return true;
                })
            );

        return merge(outsidePointerEvents, this.overlayDir.overlayRef!.detachments());
    }

    private getHeightOfOptionsContainer(): number {
        return this.optionsContainer.nativeElement.getClientRects()[0]?.height;
    }

    private updateScrollSize(): void {
        if (!this.options.first) {
            return;
        }

        this.keyManager.withScrollSize(Math.floor(this.getHeightOfOptionsContainer() / this.options.first.getHeight()));
    }

    private getTotalItemsWidthInMatcher(): number {
        const triggerClone = this.buildTriggerClone();

        triggerClone.querySelector('.kbq-select__match-hidden-text')?.remove();
        this._renderer.appendChild(this.trigger.nativeElement, triggerClone);

        let totalItemsWidth: number = 0;
        const selectedItemsViewValueContainers = triggerClone.querySelectorAll<HTMLElement>('kbq-tag');

        selectedItemsViewValueContainers.forEach((item) => (totalItemsWidth += this.getItemWidth(item)));

        triggerClone.remove();

        return totalItemsWidth;
    }

    private getItemWidth(element: HTMLElement): number {
        const computedStyle = this.window.getComputedStyle(element);

        const width: number = parseInt(computedStyle.width);
        const marginLeft: number = parseInt(computedStyle.marginLeft);
        const marginRight: number = parseInt(computedStyle.marginRight);

        return width + marginLeft + marginRight + parseInt(SelectSizeMultipleContentGap);
    }

    /** Handles keyboard events while the select is closed. */
    private handleClosedKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        const isArrowKey = [DOWN_ARROW, UP_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode);
        const isOpenKey = [ENTER, SPACE].includes(keyCode);

        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || ((this.multiSelection || event.altKey) && isArrowKey)) {
            event.preventDefault(); // prevents the page from scrolling down when pressing space
            this.open();
        } else if (!this.multiSelection) {
            this.keyManager.onKeydown(event);
        }
    }

    /** Handles keyboard events when the selected is open. */
    private handleOpenKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;

        if ((isArrowKey && event.altKey) || keyCode === ESCAPE || keyCode === TAB) {
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
        } else if (this.multiSelection && keyCode === A && event.ctrlKey) {
            this.selectAllHandler(event, this);
        } else {
            const previouslyFocusedIndex = this.keyManager.activeItemIndex;

            this.keyManager.onKeydown(event);

            if (
                this.multiSelection &&
                isArrowKey &&
                event.shiftKey &&
                this.keyManager.activeItem &&
                this.keyManager.activeItemIndex !== previouslyFocusedIndex
            ) {
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

        if (this.multiSelection && value) {
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
                    // eslint-disable-next-line no-console
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
            const correspondingOptionVirtual =
                source instanceof Array ? source.find((item) => this.compareWith(item, value)) : undefined;

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

        this.keyManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this.panelOpen && this.panel) {
                this.scrollActiveOptionIntoView();
            } else if (!this.panelOpen && !this.multiSelection && this.keyManager.activeItem) {
                this.keyManager.activeItem.selectViaInteraction();
            }
        });
    }

    /** Drops current option subscriptions and IDs and resets from scratch. */
    private resetOptions(): void {
        this.optionSelectionChanges
            .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.options.changes))
            .subscribe((event) => {
                this.onSelect(event.source, event.isUserInput);

                if (event.isUserInput && !this.multiSelection && this.panelOpen) {
                    this.close();
                    this.focus();
                }
            });

        // Listen to changes in the internal state of the options and react accordingly.
        // Handles cases like the labels of the selected options changing.
        merge(...this.options.map((option) => option.stateChanges))
            .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.options.changes))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
                this.stateChanges.next();
            });
    }

    /** Invoked when an option is clicked. */
    private onSelect(option: KbqOption, isUserInput: boolean): void {
        const wasSelected = this.selectionModel.isSelected(option);

        if (option.value == null && !this.multiSelection) {
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

            if (this.multiSelection) {
                this.sortValues();
            }
        }

        if (wasSelected !== this.selectionModel.isSelected(option)) {
            this.propagateChanges();
        }

        this.stateChanges.next();
    }

    /** Sorts the selected values in the selected based on their order in the panel. */
    private sortValues() {
        if (this.multiSelection) {
            const options = this.options.toArray();

            this.selectionModel.sort((a, b) =>
                this.sortComparator ? this.sortComparator(a, b, options) : a.value - b.value
            );
            this.stateChanges.next();
        }
    }

    /** Emits change event to set the model value. */
    private propagateChanges(fallbackValue?: any): void {
        let valueToEmit: any;

        if (this.multiSelection) {
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

    /** Gets how wide the overlay panel should be. */
    private getOverlayWidth(origin?: ElementRef | CdkOverlayOrigin): string | number {
        if (this.panelWidth === 'auto') {
            const elementRef = origin instanceof CdkOverlayOrigin ? origin.elementRef : origin || this.elementRef;

            return elementRef.nativeElement.getBoundingClientRect().width;
        }

        return this.panelWidth ?? '';
    }

    /** Comparison function to specify which option is displayed. Defaults to object equality. */
    private _compareWith = (o1: any, o2: any) => o1 === o2;

    /** Function for handling the combination Ctrl + A (select all). By default, the internal handler is used. */
    private _selectAllHandler(event: KeyboardEvent, select: KbqSelect): void {
        event.preventDefault();

        const hasDeselectedOptions = select.options.some((option) => !option.selected);

        select.options.forEach((option) => {
            if (hasDeselectedOptions && !option.disabled) {
                option.select();
            } else {
                option.deselect();
            }
        });
    }

    private getTotalVisibleItems(): [number, number] {
        const triggerClone = this.buildTriggerClone();

        this._renderer.setStyle(triggerClone.querySelector('.kbq-select__match-hidden-text'), 'display', 'block');
        this._renderer.appendChild(this.trigger.nativeElement, triggerClone);

        let visibleItemsCount: number = 0;
        let totalVisibleItemsWidth: number = 0;

        (triggerClone.querySelectorAll('kbq-tag') as NodeListOf<HTMLElement>).forEach((item) => {
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
