import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, ConnectedPosition, ViewportRuler } from '@angular/cdk/overlay';
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
    Inject,
    Input,
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
    ViewEncapsulation,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
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
    CanDisable,
    CanDisableCtor,
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    HasTabIndex,
    HasTabIndexCtor,
    KBQ_LOCALE_SERVICE,
    KBQ_SELECT_SCROLL_STRATEGY,
    KbqLocaleService,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectTrigger,
    MultipleMode,
    SELECT_PANEL_PADDING_X,
    SELECT_PANEL_VIEWPORT_PADDING,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    getKbqSelectNonFunctionValueError,
    kbqSelectAnimations,
    mixinDisabled,
    mixinErrorState,
    mixinTabIndex
} from '@koobiq/components/core';
import { KbqCleaner, KbqFormField, KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqTag } from '@koobiq/components/tags';
import { KbqTree, KbqTreeOption, KbqTreeSelection } from '@koobiq/components/tree';
import { SizeXxs as SelectSizeMultipleContentGap } from '@koobiq/design-tokens';
import { Observable, Subject, Subscription, defer, merge } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, startWith, switchMap, take } from 'rxjs/operators';

let nextUniqueId = 0;

export interface ITriggerValue {
    disabled: boolean;
    value: string;
    viewValue: string;
}

/** Change event object that is emitted when the select value has changed. */
export class KbqTreeSelectChange {
    constructor(
        public source: KbqTreeSelect,
        public value: any,
        public isUserInput = false
    ) {}
}

/** @docs-private */
class KbqTreeSelectBase {
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
const KbqTreeSelectMixinBase: CanDisableCtor & HasTabIndexCtor & CanUpdateErrorStateCtor & typeof KbqTreeSelectBase =
    mixinTabIndex(mixinDisabled(mixinErrorState(KbqTreeSelectBase)));

@Component({
    selector: 'kbq-tree-select',
    exportAs: 'kbqTreeSelect',
    templateUrl: 'tree-select.html',
    styleUrls: ['./tree-select.scss', 'tree-select-tokens.scss'],
    inputs: ['disabled', 'tabIndex'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-tree-select',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-invalid]': 'errorState',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

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
        { provide: KbqFormFieldControl, useExisting: KbqTreeSelect },
        { provide: KbqTree, useExisting: KbqTreeSelect }
    ]
})
export class KbqTreeSelect
    extends KbqTreeSelectMixinBase
    implements
        AfterContentInit,
        AfterViewInit,
        OnChanges,
        OnDestroy,
        OnInit,
        DoCheck,
        ControlValueAccessor,
        CanDisable,
        HasTabIndex,
        KbqFormFieldControl<KbqTreeOption>,
        CanUpdateErrorState
{
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

    @Input() hiddenItemsText: string = 'еще {{ number }}';

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

    @Input()
    get autoSelect(): boolean {
        if (this.multiple) {
            return false;
        }

        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

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

    get value(): any {
        return this.tree.getSelectedValues();
    }

    private _value: any = null;

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
        return this._focused || this._panelOpen;
    }

    set focused(value: boolean) {
        this._focused = value;
    }

    private _focused = false;

    get panelOpen(): boolean {
        return this._panelOpen;
    }

    get canShowCleaner(): boolean {
        return !this.disabled && this.cleaner && this.selectionModel.hasValue();
    }

    isEmptySearchResult: boolean;

    triggerValues: ITriggerValue[] = [];

    private closeSubscription = Subscription.EMPTY;

    private _panelOpen = false;

    private originalOnKeyDown: (event: KeyboardEvent) => void;

    /** The scroll position of the overlay panel, calculated to center the selected option. */
    private scrollTop = 0;

    /** Unique id for this input. */
    private readonly uid = `kbq-select-${nextUniqueId++}`;

    // Used for storing the values that were assigned before the options were initialized.
    private tempValues: string | string[] | null;

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        elementRef: ElementRef,
        readonly changeDetectorRef: ChangeDetectorRef,
        private readonly viewportRuler: ViewportRuler,
        private readonly ngZone: NgZone,
        private readonly renderer: Renderer2,
        defaultErrorStateMatcher: ErrorStateMatcher,
        @Inject(KBQ_SELECT_SCROLL_STRATEGY) private readonly scrollStrategyFactory,
        @Optional() private readonly dir: Directionality,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        @Optional() private readonly parentFormField: KbqFormField,
        @Optional() @Self() ngControl: NgControl,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        super(elementRef, defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        // Force setter to be called in case id was not specified.
        this.id = this.id;
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

                    if (this.search) {
                        this.search.focus();
                    }

                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
                    this.overlayDir.offsetX = 0;
                    this.changeDetectorRef.markForCheck();
                }
            });
    }

    ngAfterContentInit() {
        if (!this.tree) {
            return;
        }

        this.tree.resetFocusedItemOnBlur = false;
        this.tree.optionShouldHoldFocusOnBlur = true;

        this.selectionModel = this.tree.selectionModel = new SelectionModel<any>(this.multiple);

        this.selectionModel.changed.subscribe(() => {
            this.onChange(this.selectedValues);

            if (this.multiple) {
                this.refreshTriggerValues();
            }
        });

        this.tree.ngAfterContentInit();

        this.initKeyManager();

        this.options = this.tree.renderedOptions;
        this.tree.autoSelect = this.autoSelect;

        if (this.tree.multipleMode === null) {
            this.tree.multipleMode = this.multiple ? MultipleMode.CHECKBOX : null;
        }

        if (this.multiple) {
            this.tree.noUnselectLast = false;
        }

        if (this.tempValues) {
            this.setSelectionByValue(this.tempValues);
            this.tempValues = null;
        }

        this.userInteractionChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (!this.multiple && this.panelOpen) {
                this.close();

                Promise.resolve().then(() => this.focus());
            }
        });

        this.tree.selectionChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
            this.onChange(this.selectedValues);

            this.selectionChange.emit(new KbqTreeSelectChange(this, event.option));

            if (this.search) {
                this.search.focus();
            }
        });

        if (!this.multiple) {
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
        if (!this.tree) {
            return;
        }

        this.tags.changes.pipe(startWith(null)).subscribe(() => {
            this.calculateHiddenItems();
        });
    }

    ngDoCheck() {
        if (this.ngControl) {
            this.updateErrorState();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // Updating the disabled state is handled by `mixinDisabled`, but we need to additionally let
        // the parent form field know to run change detection when the disabled state changes.
        if (changes.disabled) {
            this.stateChanges.next();
        }
    }

    ngOnDestroy() {
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
        this.tree.keyManager.setActiveItem(-1);

        this.setSelectionByValue([]);

        this.onChange(this.selectedValues);
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    toggle(): void {
        if (this.panelOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open(): void {
        if (this.disabled || !this.options || !this.options.length || this._panelOpen) {
            return;
        }

        this.triggerRect = this.trigger.nativeElement.getBoundingClientRect();
        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(getComputedStyle(this.trigger.nativeElement)['font-size']);

        this._panelOpen = true;

        setTimeout(() => this.highlightCorrectOption());

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
        return this.multiple ? this.selectionModel.selected : this.selectionModel.selected[0];
    }

    get selectedValues(): any {
        const selectedValues = this.selectionModel.selected.map((value) => this.tree.treeControl.getValue(value));

        return this.multiple ? selectedValues : selectedValues[0];
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
        if (!this.disabled) {
            if (this.panelOpen) {
                this.handleOpenKeydown(event);
            } else {
                this.handleClosedKeydown(event);
            }
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
            this.calculateOverlayOffsetX();
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

    calculateHiddenItems() {
        if (this.customTrigger || this.empty || !this.multiple) {
            return;
        }

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
    }

    private updateLocaleParams = () => {
        this.hiddenItemsText = this.localeService?.getParams('select').hiddenItemsText;

        this.changeDetectorRef.markForCheck();
    };

    private closingActions() {
        const backdrop = this.overlayDir.overlayRef!.backdropClick();
        const outsidePointerEvents = this.overlayDir
            .overlayRef!.outsidePointerEvents()
            .pipe(filter((event) => !this.elementRef.nativeElement.contains(event.target)));
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

    private buildTriggerClone(): HTMLDivElement {
        const triggerClone = this.trigger.nativeElement.cloneNode(true);

        this.renderer.setStyle(triggerClone, 'position', 'absolute');
        this.renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this.renderer.setStyle(triggerClone, 'top', '-100%');
        this.renderer.setStyle(triggerClone, 'left', '0');

        return triggerClone;
    }

    private getItemWidth(element: HTMLElement): number {
        const computedStyle = window.getComputedStyle(element);

        const width: number = parseInt(computedStyle.width as string);
        const marginLeft: number = parseInt(computedStyle.marginLeft as string);
        const marginRight: number = parseInt(computedStyle.marginRight as string);

        return width + marginLeft + marginRight + parseInt(SelectSizeMultipleContentGap);
    }

    private handleClosedKeydown(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        const isArrowKey =
            keyCode === DOWN_ARROW || keyCode === UP_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW;
        const isOpenKey = keyCode === ENTER || keyCode === SPACE;

        // Open the select on ALT + arrow key to match the native <select>
        if (isOpenKey || ((this.multiple || event.altKey) && isArrowKey)) {
            // prevents the page from scrolling down when pressing space
            event.preventDefault();

            this.open();
        } else if (!this.multiple && this.tree.keyManager && this.tree.keyManager.onKeydown) {
            this.tree.keyManager.onKeydown(event);
        }
    }

    private handleOpenKeydown(event: KeyboardEvent) {
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
            }
        } else if (this.multiple && isSelectAll(event)) {
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
            const previouslyFocusedIndex = this.tree.keyManager.activeItemIndex;

            this.tree.keyManager.setFocusOrigin('keyboard');
            this.tree.keyManager.onKeydown(event);

            if (
                this.multiple &&
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
                    hasModifierKey(event, 'ctrlKey')
                );
            }

            if (this.search) {
                this.search.focus();
            }
        }
    }

    private refreshTriggerValues(): void {
        this.triggerValues = this.selectionModel.selected.map((node) => ({
            value: this.tree.treeControl.getValue(node),
            viewValue: this.tree.treeControl.getViewValue(node),
            disabled: this.tree.treeControl.isDisabled(node)
        }));

        this.changeDetectorRef.detectChanges();
    }

    private initializeSelection() {
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
    private setSelectionByValue(value: any | any[]) {
        if (this.multiple && value) {
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
            } else if (!this._panelOpen && !this.multiple && this.tree.keyManager.activeItem) {
                this.tree.keyManager.activeItem.selectViaInteraction();
            }
        });
    }

    /** Sorts the selected values in the selected based on their order in the panel. */
    private sortValues() {
        if (this.multiple) {
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

    /**
     * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
     * This must be adjusted to align the selected option text over the trigger text when
     * the panel opens. Will change based on LTR or RTL text direction. Note that the offset
     * can't be calculated until the panel has been attached, because we need to know the
     * content width in order to constrain the panel within the viewport.
     */
    private calculateOverlayOffsetX() {
        const overlayRect = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
        const viewportSize = this.viewportRuler.getViewportSize();
        const isRtl = this.isRtl();
        const paddingWidth = SELECT_PANEL_PADDING_X * 2;
        let offsetX: number = SELECT_PANEL_PADDING_X;

        // Invert the offset in LTR.
        if (!isRtl) {
            offsetX *= -1;
        }

        // Determine how much the select overflows on each side.
        const leftOverflow = 0 - (overlayRect.left + offsetX - (isRtl ? paddingWidth : 0));
        const rightOverflow = overlayRect.right + offsetX - viewportSize.width + (isRtl ? 0 : paddingWidth);

        // If the element overflows on either side, reduce the offset to allow it to fit.
        if (leftOverflow > 0) {
            offsetX += leftOverflow + SELECT_PANEL_VIEWPORT_PADDING;
        } else if (rightOverflow > 0) {
            offsetX -= rightOverflow + SELECT_PANEL_VIEWPORT_PADDING;
        }

        // Set the offset directly in order to avoid having to go through change detection and
        // potentially triggering "changed after it was checked" errors. Round the value to avoid
        // blurry content in some browsers.
        this.overlayDir.offsetX = Math.round(offsetX);
        this.overlayDir.overlayRef.updatePosition();
    }

    /** Comparison function to specify which option is displayed. Defaults to object equality. */
    private _compareWith = (o1: any, o2: any) => o1 === o2;

    private subscribeOnSearchChanges() {
        if (!this.search?.ngControl.valueChanges) {
            return;
        }

        this.search.ngControl.valueChanges.pipe(delay(0)).subscribe((value) => {
            this.isEmptySearchResult = !!value && this.tree.isEmpty;
            this.changeDetectorRef.markForCheck();
        });
    }
}
