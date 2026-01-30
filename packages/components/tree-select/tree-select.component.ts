import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Platform, _getEventTarget } from '@angular/cdk/platform';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
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
    numberAttribute
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
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
    UP_ARROW,
    hasModifierKey,
    isSelectAll
} from '@koobiq/cdk/keycodes';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_LOCALE_SERVICE,
    KBQ_PARENT_POPUP,
    KBQ_SELECT_SCROLL_STRATEGY,
    KBQ_WINDOW,
    KbqAbstractSelect,
    KbqComponentColors,
    KbqLocaleService,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectTrigger,
    MultipleMode,
    defaultOffsetY,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    isUndefined,
    kbqSelectAnimations
} from '@koobiq/components/core';
import { KbqCleaner, KbqFormField, KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTag, KbqTagRemove } from '@koobiq/components/tags';
import { KbqTree, KbqTreeOption, KbqTreeSelection } from '@koobiq/components/tree';
import { SizeXxs as SelectSizeMultipleContentGap } from '@koobiq/design-tokens';
import { Observable, Subject, Subscription, audit, defer, fromEvent, merge } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, startWith, switchMap, take } from 'rxjs/operators';

let nextUniqueId = 0;

/** Tree select trigger value type. */
export type KbqTreeSelectTriggerValue = {
    disabled: boolean;
    value: string;
    viewValue: string;
};

/** Tree select panel width type. */
export type KbqTreeSelectPanelWidth = 'auto' | number | null;

/** Options for the `kbq-tree-select` that can be configured using the `KBQ_TREE_SELECT_OPTIONS` injection token. */
export type KbqTreeSelectOptions = Partial<{
    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width.
     * If set to null or an empty string, the panel will grow to match the longest option's text.
     */
    panelWidth: KbqTreeSelectPanelWidth;
    /**
     * Minimum width of the panel. If minWidth is larger than window width or property set to null, it will be ignored.
     */
    panelMinWidth: Exclude<KbqTreeSelectPanelWidth, 'auto'>;
    /**
     * Whether to enable hiding search by default if options is less than minimum.
     *
     * - `'auto'` uses `KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD` as min value.
     * - number - will enables search hiding and uses value as min.
     * @see KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD
     */
    searchMinOptionsThreshold: 'auto' | number;
}>;

/** Injection token that can be used to provide the default options for the `kbq-tree-select`. */
export const KBQ_TREE_SELECT_OPTIONS = new InjectionToken<KbqTreeSelectOptions>('KBQ_TREE_SELECT_OPTIONS');

/** Utility provider for `KBQ_TREE_SELECT_OPTIONS`. */
export const kbqTreeSelectOptionsProvider = (options: KbqTreeSelectOptions): Provider => {
    return {
        provide: KBQ_TREE_SELECT_OPTIONS,
        useValue: options
    };
};

/** Change event object that is emitted when the select value has changed. */
export class KbqTreeSelectChange {
    constructor(
        public source: KbqTreeSelect,
        public value: any,
        public isUserInput = false,
        public values?: unknown[]
    ) {}
}

@Component({
    selector: 'kbq-tree-select',
    imports: [
        CdkOverlayOrigin,
        KbqIconModule,
        KbqTagRemove,
        CdkConnectedOverlay,
        CdkMonitorFocus,
        NgClass,
        KbqTag,
        NgTemplateOutlet
    ],
    templateUrl: 'tree-select.html',
    styleUrls: ['./tree-select.scss', './tree-select-tokens.scss', '../select/select-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTreeSelect',
    host: {
        class: 'kbq-tree-select',
        '[class.kbq-select_multiple]': 'multiple',
        '[class.kbq-select_multiline]': 'multiline',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-invalid]': 'errorState',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        '(click)': 'handleClick()',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    },
    animations: [
        kbqSelectAnimations.transformPanel,
        kbqSelectAnimations.fadeInContent
    ],
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqTreeSelect },
        { provide: KbqTree, useExisting: KbqTreeSelect },
        { provide: KBQ_PARENT_POPUP, useExisting: KbqTreeSelect }
    ]
})
export class KbqTreeSelect
    extends KbqAbstractSelect
    implements
        AfterContentInit,
        AfterViewInit,
        OnDestroy,
        OnInit,
        DoCheck,
        ControlValueAccessor,
        KbqFormFieldControl<KbqTreeOption>,
        CanUpdateErrorState
{
    protected readonly isBrowser = inject(Platform).isBrowser;

    private readonly defaultOptions = inject(KBQ_TREE_SELECT_OPTIONS, { optional: true });

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
    selectionModel: SelectionModel<any>;

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
     * is aligned with with the top "start" of the origin by default (overlapping
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

    options: QueryList<KbqTreeOption>;

    /**
     * Trigger - is a clickable field to open select dropdown panel
     */
    @ViewChild('trigger', { static: false }) trigger: ElementRef;

    @ViewChild('panel', { static: false }) panel: ElementRef;

    @ViewChild(CdkConnectedOverlay, { static: false }) overlayDir: CdkConnectedOverlay;

    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;

    @ContentChild('kbqSelectCleaner', { static: true }) cleaner: KbqCleaner;

    /** User-supplied override of the trigger element. */
    @ContentChild(KbqSelectTrigger, { static: false }) customTrigger: KbqSelectTrigger;

    @ContentChild(KbqSelectMatcher, { static: false }) customMatcher: KbqSelectMatcher;

    @ContentChild('kbqSelectTagContent', { static: false, read: TemplateRef }) customTagTemplateRef: TemplateRef<any>;

    @ContentChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

    @ContentChild(KbqSelectSearch, { static: false }) search: KbqSelectSearch;

    @Input() hiddenItemsText: string = '+{{ number }}';

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
    @Output() readonly selectionChange = new EventEmitter<KbqTreeSelectChange>();

    /**
     * Event that emits whenever the raw value of the select changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

    /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    /** Object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Function used to sort the values in a select in multiple mode.
     * Follows the same logic as `Array.prototype.sort`.
     */
    @Input() sortComparator: (a: KbqTreeOption, b: KbqTreeOption, options: KbqTreeOption[]) => number;

    /**
     * Whether to use a multiline matcher or not. Default is false
     */
    @Input({ transform: booleanAttribute }) multiline: boolean = false;

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<KbqTreeSelectChange> = defer(() => {
        if (this.options) {
            return this.options.changes.pipe(
                startWith(this.options),
                switchMap(() => merge(...this.options.map((option) => option.onSelectionChange)))
            );
        }

        return this.ngZone.onStable.asObservable().pipe(
            take(1),
            switchMap(() => this.optionSelectionChanges)
        );
    }) as Observable<KbqTreeSelectChange>;

    /** Combined stream of all of the child options userInteraction events. */
    readonly userInteractionChanges: Observable<void> = defer(() => {
        if (this.options) {
            return this.options.changes.pipe(
                startWith(this.options),
                switchMap(() => merge(...this.options.map((option) => option.userInteraction)))
            );
        }

        return this.ngZone.onStable.asObservable().pipe(
            take(1),
            switchMap(() => this.userInteractionChanges)
        );
    });

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

        this._multiple = coerceBooleanProperty(value);
    }

    private _multiple: boolean = false;

    @Input()
    get autoSelect(): boolean {
        if (this.multiSelection) {
            return false;
        }

        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

    get value(): any {
        return this.tree.getSelectedValues();
    }

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
        this.stateChanges.next();
    }

    private _id: string;

    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    private _hasBackdrop: boolean = false;

    @Input()
    get tabIndex(): number | null {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number | null) {
        if (Number.isInteger(value) || value === null) {
            this._tabIndex = value;
        }
    }

    private _tabIndex: number | null = 0;

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

    /**
     * Function for handling the combination Ctrl + A (select all). By default, the internal handler is used.
     */
    @Input()
    get selectAllHandler() {
        return this._selectAllHandler;
    }

    set selectAllHandler(fn: (event: KeyboardEvent, select: KbqTreeSelect) => void) {
        if (typeof fn !== 'function') {
            throw Error('`selectAllHandler` must be a function.');
        }

        this._selectAllHandler = fn;
    }

    /** Function for handling the combination Ctrl + A (select all). By default, the internal handler is used. */
    private _selectAllHandler(event: KeyboardEvent, select: KbqTreeSelect): void {
        event.preventDefault();

        select.tree.selectAllOptions();
    }

    /** Whether the select is focused. */
    get focused(): boolean {
        return this._focused || this._panelOpen;
    }

    set focused(value: boolean) {
        this._focused = value;
    }

    /** Whether multiple choice is enabled or not. True if multiple or multiline */
    get multiSelection(): boolean {
        return this.multiple || this.multiline;
    }

    private _focused = false;

    /** Width of the overlay panel. */
    protected overlayWidth: string | number;

    /** Min width of the overlay panel. */
    protected overlayMinWidth: string | number;

    /**
     * Minimum width of the panel.
     * If minWidth is larger than window width, it will be ignored.
     */
    @Input({ transform: numberAttribute }) panelMinWidth: Exclude<KbqTreeSelectPanelWidth, 'auto'> =
        this.defaultOptions?.panelMinWidth ?? 200;

    /** Origin for the overlay panel. */
    protected overlayOrigin?: CdkOverlayOrigin | ElementRef;

    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width.
     * If set to null or an empty string, the panel will grow to match the longest option's text.
     */
    @Input() panelWidth: KbqTreeSelectPanelWidth = this.defaultOptions?.panelWidth || null;
    /**
     * Controls when the search functionality is displayed based on the number of available options.
     *
     * Automatically enables search hiding if value provided, even if `defaultOptions.searchMinOptionsThreshold` is provided.
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

    private _searchMinOptionsThreshold = this.resolveSearchMinOptionsThreshold();

    get panelOpen(): boolean {
        return this._panelOpen;
    }

    get canShowCleaner(): boolean {
        return !this.disabled && this.cleaner && this.selectionModel.hasValue();
    }

    /** @docs-private */
    get colorForState(): KbqComponentColors {
        const hasLegacyValidateDirective = this.elementRef.nativeElement.classList.contains(
            'kbq-control_has-validate-directive'
        );

        return (hasLegacyValidateDirective && this.ngControl?.invalid) || this.errorState
            ? KbqComponentColors.Error
            : KbqComponentColors.ContrastFade;
    }

    isEmptySearchResult: boolean;

    triggerValues: KbqTreeSelectTriggerValue[] = [];

    private closeSubscription = Subscription.EMPTY;

    private _panelOpen = false;

    private originalOnKeyDown: (event: KeyboardEvent) => void;

    /** The scroll position of the overlay panel, calculated to center the selected option. */
    private scrollTop = 0;

    /** Unique id for this input. */
    private readonly uid = `kbq-tree-select-${nextUniqueId++}`;

    // Used for storing the values that were assigned before the options were initialized.
    private tempValues: string | string[] | null;

    private readonly destroyRef = inject(DestroyRef);
    private readonly window = inject(KBQ_WINDOW);

    constructor(
        public elementRef: ElementRef<HTMLElement>,
        readonly changeDetectorRef: ChangeDetectorRef,
        private readonly ngZone: NgZone,
        private readonly renderer: Renderer2,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        @Inject(KBQ_SELECT_SCROLL_STRATEGY) private readonly scrollStrategyFactory,
        @Optional() private readonly dir: Directionality,
        @Optional() public parentForm: NgForm,
        @Optional() public parentFormGroup: FormGroupDirective,
        @Host() @Optional() private readonly parentFormField: KbqFormField,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        super();

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

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
        this.stateChanges.next();

        // We need `distinctUntilChanged` here, because some browsers will
        // fire the animation end event twice for the same animation. See:
        // https://github.com/angular/angular/issues/24084
        this.panelDoneAnimatingStream
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                if (this.panelOpen) {
                    this.scrollTop = 0;

                    setTimeout(() => {
                        this.highlightCorrectOption();

                        if (this.search) {
                            this.search.focus();
                        }
                    });

                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
                    this.overlayDir.offsetX = 0;
                    this.changeDetectorRef.markForCheck();
                }
            });
    }

    ngDoCheck() {
        if (this.ngControl) {
            this.updateErrorState();
        }
    }

    ngAfterContentInit() {
        if (!this.tree) return;

        this.tree.resetFocusedItemOnBlur = false;
        this.tree.optionShouldHoldFocusOnBlur = !!this.search;

        this.selectionModel = this.tree.selectionModel = new SelectionModel<any>(this.multiSelection);

        this.selectionModel.changed.subscribe(() => {
            this.onChange(this.selectedValues);

            if (this.multiSelection) {
                this.refreshTriggerValues();
            }
        });

        this.selectionModel.changed.pipe(delay(0)).subscribe(() => this.setOverlayPosition());

        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.tree.ngAfterContentInit();

        this.initKeyManager();

        this.options = this.tree.renderedOptions;
        this.tree.autoSelect = this.autoSelect;

        if (this.tree.multipleMode === null) {
            // setTimeout need for prevent an error "NG0100: ExpressionChangedAfterItHasBeenCheckedError"
            setTimeout(() => (this.tree.multipleMode = this.multiSelection ? MultipleMode.CHECKBOX : null));
        }

        if (this.multiSelection) {
            this.tree.noUnselectLast = false;
        }

        if (this.tempValues) {
            this.setSelectionByValue(this.tempValues);
            this.tempValues = null;
        }

        this.userInteractionChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (!this.multiSelection && this.panelOpen) {
                this.close();

                Promise.resolve().then(() => this.focus());
            }
        });

        this.tree.selectionChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
            this.selectionChange.emit(new KbqTreeSelectChange(this, event.option, false, event.options));

            if (this.search) {
                this.search.focus();
            }
        });

        if (!this.multiSelection) {
            this.selectionModel.changed
                .pipe(
                    filter(({ added }) => !!added.length),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe(({ added }) => {
                    this.tree.keyManager.setFocusOrigin('program');
                    this.tree.keyManager.setActiveItem(this.options.find(({ data }) => data === added[0]) as any);
                });
        }

        this.subscribeOnSearchChanges();
    }

    ngAfterViewInit() {
        if (!this.tree) return;

        this.tree.treeControl.expansionModel.changed
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.setOverlayPosition());
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
        this.tree.keyManager.setActiveItem(-1);

        this.setSelectionByValue([]);

        this.onChange(this.selectedValues);

        this.selectionChange.emit(new KbqTreeSelectChange(this, this.selectedValues));

        this.focus();
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    handleClick() {
        if (this.customMatcher && !this.customMatcher.useDefaultHandlers) return;

        this.toggle();
    }

    toggle(): void {
        if (this.panelOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open(): void {
        if (this.disabled || !this.options || !this.options.length || this._panelOpen) return;

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

        this._panelOpen = true;

        this.changeDetectorRef.markForCheck();

        // Set the font size on the panel element once it exists.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                if (this.triggerFontSize && this.overlayDir.overlayRef && this.overlayDir.overlayRef.overlayElement) {
                    this.overlayDir.overlayRef.overlayElement.style.fontSize = `${this.triggerFontSize}px`;
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (!this._panelOpen) {
            return;
        }

        this._panelOpen = false;

        this.changeDetectorRef.markForCheck();
        this.onTouched();

        if (this.search) {
            this.search.reset();
        }
    }

    /**
     * Sets the select's value. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param value New value to be written to the model.
     */
    writeValue(value: any): void {
        if (this.tree) {
            this.setSelectionByValue(value);
        } else {
            this.tempValues = value;
        }
    }

    /**
     * Saves a callback function to be invoked when the select's value
     * changes from user input. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the value changes.
     */
    registerOnChange(fn: (value: any) => void) {
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
    registerOnTouched(fn: () => {}) {
        this.onTouched = fn;
    }

    /**
     * Disables the select. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param isDisabled Sets whether the component is disabled.
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }

    get selected(): any {
        return this.multiSelection ? this.selectionModel?.selected : this.selectionModel?.selected[0];
    }

    get selectedValues(): any {
        const selectedValues = this.selectionModel.selected.map((value) => this.tree.treeControl.getValue(value));

        return this.multiSelection ? selectedValues : selectedValues[0];
    }

    get triggerValue(): string {
        if (this.empty) {
            return '';
        }

        return this.tree.treeControl.getViewValue(this.selected);
    }

    get empty(): boolean {
        return !this.selectionModel || this.selectionModel.isEmpty();
    }

    isRtl(): boolean {
        return this.dir ? this.dir.value === 'rtl' : false;
    }

    get firstSelected() {
        return this.selectionModel.selected.filter((node) => !this.tree.treeControl.isDisabled(node))[0];
    }

    handleKeydown(event: KeyboardEvent) {
        if (this.customMatcher && !this.customMatcher.useDefaultHandlers) return;

        if (!this.disabled) {
            if (this.panelOpen) {
                this.panelKeydownHandler(event);
            } else {
                this.triggerKeydownHandler(event);
            }
        }
    }

    onFocus() {
        if (this.customMatcher && !this.customMatcher.useDefaultHandlers) return;

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
        if (this.customMatcher && !this.customMatcher.useDefaultHandlers) return;

        this._focused = false;

        if (!this.disabled && !this.panelOpen) {
            this.onTouched();
            this.changeDetectorRef.markForCheck();
            this.stateChanges.next();

            if (this.ngControl?.control) {
                const control = this.ngControl.control;

                control.updateValueAndValidity({ emitEvent: false });
                (control.statusChanges as EventEmitter<string>).emit(control.status);
            }
        }
    }

    /** Callback that is invoked when the overlay panel has been attached. */
    onAttached() {
        this.overlayDir.positionChange.pipe(take(1)).subscribe(() => {
            this.changeDetectorRef.detectChanges();
            this.setOverlayPosition();
            this.panel.nativeElement.scrollTop = this.scrollTop;

            this.tree.updateScrollSize();
        });

        this.closeSubscription = this.closingActions().subscribe(() => this.close());
    }

    /** Returns the theme to be used on the panel. */
    getPanelTheme(): string {
        return this.parentFormField ? `kbq-${this.parentFormField.color}` : '';
    }

    focus() {
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
    onRemoveSelectedOption(selectedOption: any, $event) {
        $event.stopPropagation();

        this.selectionModel.deselect(
            this.selected.find((value) => this.tree.treeControl.getValue(value) === selectedOption.value)
        );

        this.selectionChange.emit(
            new KbqTreeSelectChange(
                this,
                this.options.find((option) => option.value === selectedOption.value) || selectedOption.value
            )
        );

        this.onChange(this.selectedValues);
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

        this.hiddenItems = this.selectionModel.selected.length - visibleItems;
        this.changeDetectorRef.detectChanges();

        if (this.hiddenItems) {
            const itemsCounter = this.trigger.nativeElement.querySelector('.kbq-select__match-hidden-text');
            const matcherList = this.trigger.nativeElement.querySelector('.kbq-select__match-list');

            const itemsCounterShowed = itemsCounter.offsetTop < itemsCounter.offsetHeight;
            const itemsCounterWidth: number = Math.floor(itemsCounter.getBoundingClientRect().width);

            const matcherListWidth: number = Math.floor(matcherList.getBoundingClientRect().width);
            const matcherWidth: number = matcherListWidth + (itemsCounterShowed ? itemsCounterWidth : 0);

            if (itemsCounterShowed && totalItemsWidth < matcherWidth) {
                this.hiddenItems = 0;
                this.changeDetectorRef.detectChanges();
            }

            if (
                totalVisibleItemsWidth === matcherListWidth ||
                totalVisibleItemsWidth + itemsCounterWidth < matcherListWidth
            ) {
                this.changeDetectorRef.markForCheck();

                return;
            }
        }

        this.changeDetectorRef.markForCheck();
    };

    triggerKeydownHandler(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        const isArrowKey =
            keyCode === DOWN_ARROW || keyCode === UP_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW;
        const isOpenKey = keyCode === ENTER || keyCode === SPACE;

        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || ((this.multiSelection || event.altKey) && isArrowKey)) {
            // prevents the page from scrolling down when pressing space
            event.preventDefault();

            this.open();
        } else if (!this.multiSelection && this.tree.keyManager && this.tree.keyManager.onKeydown) {
            this.tree.keyManager.onKeydown(event);
        }
    }

    panelKeydownHandler(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;

        if ((isArrowKey && event.altKey) || keyCode === ESCAPE || keyCode === TAB) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();
            this.close();
            this.focus();
        } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
            return this.originalOnKeyDown.call(this.tree, event);
        } else if (keyCode === HOME) {
            event.preventDefault();

            this.tree.keyManager.setFirstItemActive();
        } else if (keyCode === END) {
            event.preventDefault();

            this.tree.keyManager.setLastItemActive();
        } else if (keyCode === PAGE_UP) {
            event.preventDefault();

            this.tree.keyManager.setPreviousPageItemActive();
        } else if (keyCode === PAGE_DOWN) {
            event.preventDefault();

            this.tree.keyManager.setNextPageItemActive();
        } else if ((keyCode === ENTER || keyCode === SPACE) && this.tree.keyManager.activeItem) {
            event.preventDefault();

            if (!this.autoSelect) {
                this.originalOnKeyDown.call(this.tree, event);
            } else {
                this.close();
                this.focus();
            }
        } else if (this.multiSelection && isSelectAll(event)) {
            this.selectAllHandler(event, this);
        } else {
            const previouslyFocusedIndex = this.tree.keyManager.activeItemIndex;

            this.tree.keyManager.setFocusOrigin('keyboard');
            this.tree.keyManager.onKeydown(event);

            if (
                this.multiSelection &&
                isArrowKey &&
                event.shiftKey &&
                this.tree.keyManager.activeItem &&
                this.tree.keyManager.activeItemIndex !== previouslyFocusedIndex
            ) {
                this.tree.keyManager.activeItem.selectViaInteraction(event);
            }

            if (this.autoSelect && this.tree.keyManager.activeItem) {
                this.tree.setSelectedOptionsByKey(
                    this.tree.keyManager.activeItem,
                    hasModifierKey(event, 'shiftKey'),
                    // ctrlKey is for Windows, metaKey is for MacOS
                    hasModifierKey(event, 'ctrlKey', 'metaKey')
                );
            }

            if (this.search) {
                this.search.focus();
            }
        }
    }

    /** @docs-private */
    protected shouldShowSearch(): boolean {
        return isUndefined(this.searchMinOptionsThreshold) || this.options.length >= this.searchMinOptionsThreshold;
    }

    private updateLocaleParams = () => {
        this.hiddenItemsText = this.localeService?.getParams('select').hiddenItemsText;

        this.changeDetectorRef.markForCheck();
    };

    private closingActions() {
        const backdrop = this.overlayDir.overlayRef!.backdropClick();
        const outsidePointerEvents = this.overlayDir
            .overlayRef!.outsidePointerEvents()
            .pipe(filter((event) => !this.elementRef.nativeElement.contains(_getEventTarget(event))));
        const detachments = this.overlayDir.overlayRef!.detachments();

        return merge(backdrop, outsidePointerEvents, detachments);
    }

    private getTotalItemsWidthInMatcher(): number {
        const triggerClone = this.buildTriggerClone();

        triggerClone.querySelector('.kbq-select__match-hidden-text')?.remove();
        this.renderer.appendChild(this.trigger.nativeElement, triggerClone);

        let totalItemsWidth: number = 0;
        const selectedItemsViewValueContainers = triggerClone.querySelectorAll<HTMLElement>('kbq-tag');

        selectedItemsViewValueContainers.forEach((item) => (totalItemsWidth += this.getItemWidth(item)));

        triggerClone.remove();

        return totalItemsWidth;
    }

    private getTotalVisibleItems(): [number, number] {
        const triggerClone = this.buildTriggerClone();

        this.renderer.setStyle(triggerClone.querySelector('.kbq-select__match-hidden-text'), 'display', 'block');
        this.renderer.appendChild(this.trigger.nativeElement, triggerClone);

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

    /** Gets how wide the overlay panel should be. */
    private getOverlayWidth(origin?: ElementRef | CdkOverlayOrigin): string | number {
        if (this.panelWidth === 'auto') {
            const elementRef = origin instanceof CdkOverlayOrigin ? origin.elementRef : origin || this.elementRef;

            return elementRef.nativeElement.getBoundingClientRect().width;
        }

        return this.panelWidth ?? '';
    }

    private buildTriggerClone(): HTMLDivElement {
        const triggerClone = this.trigger.nativeElement.cloneNode(true);

        this.renderer.setStyle(triggerClone, 'position', 'absolute');
        this.renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this.renderer.setStyle(triggerClone, 'top', '-100%');
        this.renderer.setStyle(triggerClone, 'left', '0');

        return triggerClone;
    }

    private getItemWidth(element: HTMLElement): number {
        const computedStyle = this.window.getComputedStyle(element);

        const width: number = parseInt(computedStyle.width as string);
        const marginLeft: number = parseInt(computedStyle.marginLeft as string);
        const marginRight: number = parseInt(computedStyle.marginRight as string);

        return width + marginLeft + marginRight + parseInt(SelectSizeMultipleContentGap);
    }

    private refreshTriggerValues(): void {
        this.triggerValues = this.selectionModel.selected.map((node) => ({
            value: this.tree.treeControl.getValue(node),
            viewValue: this.tree.treeControl.getViewValue(node),
            disabled: this.tree.treeControl.isDisabled(node)
        }));

        this.changeDetectorRef.detectChanges();
    }

    /**
     * Sets the selected option based on a value. If no option can be
     * found with the designated value, the select trigger is cleared.
     */
    private setSelectionByValue(value: any | any[]) {
        if (this.multiSelection && value) {
            if (!Array.isArray(value)) {
                throw getKbqSelectNonArrayValueError();
            }

            this.tree.setOptionsFromValues(value);

            this.sortValues();
        } else {
            this.tree.setOptionsFromValues([value]);
        }

        this.changeDetectorRef.detectChanges();
    }

    private initKeyManager() {
        this.originalOnKeyDown = this.tree.onKeyDown;

        this.tree.onKeyDown = () => {};

        this.tree.keyManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this._panelOpen && this.panel) {
                this.scrollActiveOptionIntoView();
            } else if (!this._panelOpen && !this.multiSelection && this.tree.keyManager.activeItem) {
                this.tree.keyManager.activeItem.selectViaInteraction();
            }
        });
    }

    /** Sorts the selected values in the selected based on their order in the panel. */
    private sortValues() {
        if (this.multiSelection) {
            const options = this.options.toArray();

            this.selectionModel.sort((a, b) => {
                return this.sortComparator
                    ? this.sortComparator(a, b, options)
                    : options.indexOf(a) - options.indexOf(b);
            });

            this.stateChanges.next();
        }
    }

    /**
     * Highlights the selected item. If no option is selected, it will highlight
     * the first item instead.
     */
    private highlightCorrectOption() {
        if (!this.tree.keyManager) {
            return;
        }

        const selectedOption = this.options.find((option) => (option.data as any) === this.firstSelected);

        this.tree.keyManager.setFocusOrigin('keyboard');

        if (selectedOption) {
            this.tree.keyManager.setActiveItem(selectedOption);
        } else {
            this.tree.keyManager.setFirstItemActive();

            if (this.tree.keyManager.activeItem?.disabled) {
                this.tree.keyManager.setActiveItem(-1);
            }
        }
    }

    /** Scrolls the active option into view. */
    private scrollActiveOptionIntoView() {
        this.tree.keyManager.activeItem?.focus();
    }

    private subscribeOnSearchChanges() {
        if (!this.search?.ngControl.valueChanges) return;

        this.search.ngControl.valueChanges.pipe(audit(() => this.tree.unorderedOptions.changes)).subscribe((value) => {
            this.isEmptySearchResult = !!value && this.tree.isEmpty;
            this.changeDetectorRef.markForCheck();
        });
    }
}
