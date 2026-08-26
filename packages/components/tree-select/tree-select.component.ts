import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Platform, _getEventTarget } from '@angular/cdk/platform';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    DoCheck,
    ElementRef,
    EventEmitter,
    InjectionToken,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    Provider,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
    afterNextRender,
    booleanAttribute,
    computed,
    contentChild,
    effect,
    inject,
    input,
    numberAttribute,
    output,
    signal,
    viewChild
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    ErrorStateMatcher,
    HOME,
    KBQ_CONNECTED_OVERLAY_ABOVE_CLASS,
    KBQ_CONNECTED_OVERLAY_BELOW_CLASS,
    KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS,
    KBQ_PANEL_DEFAULT_MAX_HEIGHT,
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KBQ_PANEL_MIN_MAX_HEIGHT,
    KBQ_PARENT_POPUP,
    KBQ_SELECT_LOCALE_CONFIGURATION,
    KBQ_SELECT_SCROLL_STRATEGY,
    KBQ_WINDOW,
    KbqAbstractSelect,
    KbqComponentColors,
    KbqPanelAnchor,
    KbqPanelMaxHeight,
    KbqPanelMaxWidth,
    KbqPanelMinWidth,
    KbqPanelSpaceContext,
    KbqPanelWidth,
    KbqSelectAllEvent,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectTrigger,
    KbqSiblingPopup,
    LEFT_ARROW,
    MultipleMode,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW,
    defaultOffsetY,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    hasModifierKey,
    isInput,
    isSelectAll,
    isUndefined,
    kbqInjectLocaleConfiguration,
    kbqResolveAvailablePanelMaxHeight,
    kbqResolvePanelMaxHeightToken,
    kbqResolvePanelSideSpace,
    kbqResolveTriggerFirstRowOffset,
    kbqSelectAnimations,
    kbqShouldAnchorPanelToFirstRow,
    kbqSiblingPopupProvider,
    shouldSelectSearchText
} from '@koobiq/components/core';
import {
    KBQ_FORM_FIELD,
    KbqCleaner,
    KbqFormFieldControl,
    kbqCleanerFactoryProvider
} from '@koobiq/components/form-field';
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

/**
 * Tree select panel width type.
 * @deprecated Use `KbqPanelWidth` from `@koobiq/components/core` instead.
 */
export type KbqTreeSelectPanelWidth = KbqPanelWidth;

/** Options for the `kbq-tree-select` that can be configured using the `KBQ_TREE_SELECT_OPTIONS` injection token. */
export type KbqTreeSelectOptions = Partial<{
    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width.
     * If set to null or an empty string, the panel will grow to match the longest option's text.
     */
    panelWidth: KbqPanelWidth;
    /**
     * Minimum width of the panel. If minWidth is larger than window width or property set to null, it will be ignored.
     */
    panelMinWidth: KbqPanelMinWidth;
    /**
     * Maximum width of the panel. Caps growth by content only — it never overrides the trigger width or an
     * explicit `panelWidth`. If null, the `--kbq-panel-size-width-max` token applies.
     */
    panelMaxWidth: KbqPanelMaxWidth;
    /**
     * Maximum height of the panel's scrollable option list. Does not include the search field or the
     * footer. If null, the `--kbq-select-panel-size-max-height` token applies.
     */
    panelMaxHeight: KbqPanelMaxHeight;
    /**
     * Maximum number of tag rows a multiline trigger grows to before the tag list starts scrolling.
     * If null, the trigger is unbounded.
     */
    multilineMaxRows: number | null;
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
        KbqTag,
        NgTemplateOutlet
    ],
    templateUrl: 'tree-select.html',
    styleUrls: ['./tree-select.scss', './tree-select-tokens.scss', '../select/select-tokens.scss'],
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqTreeSelect },
        kbqCleanerFactoryProvider(() => {
            const treeSelect = inject(KbqTreeSelect);

            return {
                get control() {
                    return treeSelect;
                },
                get keydownTarget() {
                    return treeSelect.elementRef.nativeElement;
                },
                clearByEscape: false,
                clear: () => treeSelect.clear()
            };
        }),
        { provide: KbqTree, useExisting: KbqTreeSelect },
        { provide: KBQ_PARENT_POPUP, useExisting: KbqTreeSelect },
        kbqSiblingPopupProvider(KbqTreeSelect)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tree-select',
        '[class.kbq-select_multiple]': 'multiple',
        '[class.kbq-select_multiline]': 'multiline()',
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
    exportAs: 'kbqTreeSelect'
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
        CanUpdateErrorState,
        KbqSiblingPopup
{
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly ngZone = inject(NgZone);
    private readonly renderer = inject(Renderer2);
    defaultErrorStateMatcher = inject(ErrorStateMatcher);
    private readonly scrollStrategyFactory = inject(KBQ_SELECT_SCROLL_STRATEGY);
    private readonly dir = inject(Directionality, { optional: true });
    parentForm = inject(NgForm, { optional: true });
    parentFormGroup = inject(FormGroupDirective, { optional: true });
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { host: true, optional: true })!;
    ngControl = inject(NgControl, { optional: true, self: true });
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
     * The y-offset of the overlay panel in relation to the trigger.
     *
     * @deprecated noop. The trigger↔panel gap is now controlled by the `--kbq-connected-overlay-gap` CSS
     * variable (transparent padding inside the pane via the `kbq-connected-overlay_below/_above` panel
     * classes), not by a physical overlay offset — so setting this has no effect. Will be removed in 21.0.0.
     */
    offsetY = 0;

    /**
     * Minimum space to keep between the overlay and the viewport edge.
     * At least `defaultOffsetY` so CDK's fit check — which runs before the `kbq-connected-overlay_below/_above`
     * gap padding is applied to the pane — stays conservative enough to absorb that padding instead of
     * letting the panel overflow the viewport by the size of the gap.
     */
    protected readonly viewportMargin = defaultOffsetY;

    /**
     * Opens the panel below the trigger, falling back to above it when it does not fit. The panel never
     * overlaps the trigger: the option list shrinks to the room left on the chosen side instead — see
     * `fitPanelToViewport`.
     */
    positions: ConnectedPosition[] = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            panelClass: KBQ_CONNECTED_OVERLAY_BELOW_CLASS
        },
        {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            panelClass: KBQ_CONNECTED_OVERLAY_ABOVE_CLASS
        }
    ];

    options: QueryList<KbqTreeOption>;

    /**
     * Trigger - is a clickable field to open select dropdown panel
     */
    readonly trigger = viewChild.required<ElementRef>('trigger');

    /** Reference to the overlay panel element. */
    readonly panel = viewChild<ElementRef>('panel');

    /**
     * Scrollable option list inside the panel. Everything else in the panel adds to its total height, which is
     * what `fitPanelToViewport` subtracts before deciding how tall the list may be.
     * @docs-private
     */
    protected readonly optionsContainer = viewChild<ElementRef>('optionsContainer');

    /**
     * Row container of a multi-selection trigger. Absent for a single value, an empty trigger and a custom
     * matcher or trigger — all of which have no rows for the panel to anchor to.
     * @docs-private
     */
    protected readonly multilineMatchList = viewChild<ElementRef<HTMLElement>>('multilineMatchList');

    @ViewChild(CdkConnectedOverlay, { static: false }) overlayDir: CdkConnectedOverlay;

    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;

    /**
     * Reference to the optional cleaner element for clearing selection.
     * @docs-private
     */
    readonly cleaner = contentChild(KbqCleaner, { descendants: false });

    /** User-supplied override of the trigger element. */
    readonly customTrigger = contentChild(KbqSelectTrigger);

    readonly customMatcher = contentChild(KbqSelectMatcher);

    readonly customTagTemplateRef = contentChild('kbqSelectTagContent', { read: TemplateRef });

    readonly tree = contentChild(KbqTreeSelection);

    readonly search = contentChild(KbqSelectSearch);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get hiddenItemsText(): string {
        return this._hiddenItemsText ?? this.localeConfiguration().hiddenItemsText;
    }

    set hiddenItemsText(value: string) {
        this._hiddenItemsText = value;
    }

    private _hiddenItemsText?: string;

    private readonly localeConfiguration = kbqInjectLocaleConfiguration('select', KBQ_SELECT_LOCALE_CONFIGURATION);

    /**
     * Event emitted when the select panel has been toggled.
     * Also serves as the `openedChange` member of the `KbqSiblingPopup` contract — a tooltip sharing
     * this element's host reacts to it, so its emission timing (gated on `panelDoneAnimatingStream`, see
     * `ngOnInit`) matters beyond this output's original consumers.
     */
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
    readonly selectionChange = output<KbqTreeSelectChange>();

    /**
     * Event emitted whenever the tree's `selectAllOptions()` runs — a click on the `selectAll` master
     * checkbox, the Ctrl/Cmd + A shortcut, or a custom `selectAllHandler` that delegates to it.
     */
    readonly onSelectAll = output<KbqSelectAllEvent<KbqTreeOption, KbqTreeSelect>>();

    /**
     * Event that emits whenever the raw value of the select changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    readonly valueChange = output<any>();

    /** Classes to be passed to the select panel. Supports the same syntax as the `[class]` binding. */
    readonly panelClass = input<
        | string
        | string[]
        | Set<string>
        | {
              [key: string]: any;
          }
    >(undefined!);

    readonly backdropClass = input<string>('cdk-overlay-transparent-backdrop');

    /** Object used to control when error messages are shown. */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Function used to sort the values in a select in multiple mode.
     * Follows the same logic as `Array.prototype.sort`.
     */
    readonly sortComparator = input<(a: KbqTreeOption, b: KbqTreeOption, options: KbqTreeOption[]) => number>(
        undefined!
    );

    /**
     * Whether to use a multiline matcher or not. Default is false
     */
    readonly multiline = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Maximum number of tag rows a multiline trigger grows to before the tag list starts scrolling.
     * `null` leaves the trigger unbounded, so it keeps growing with every selected option. Ignored when
     * `multiline` is false.
     */
    readonly multilineMaxRows = input<number | null, unknown>(
        this.defaultOptions?.multilineMaxRows === undefined ? null : this.defaultOptions.multilineMaxRows,
        { transform: numberAttribute }
    );

    /**
     * `multilineMaxRows` rendered as a CSS length for the `--kbq-select-size-multiline-max-height` token.
     * `null` removes the inline property, and the stylesheet's `none` fallback leaves the trigger unbounded.
     * @docs-private
     */
    protected readonly multilineMaxHeightToken = computed(() => {
        const rows = this.multilineMaxRows();

        if (!this.multiline() || !Number.isFinite(rows)) return null;

        const clampedRows = Math.max(rows as number, 1);

        return `calc(${clampedRows} * var(--kbq-size-xxl) + ${clampedRows - 1} * var(--kbq-size-xxs))`;
    });

    /** Combined stream of all of the child options' change events. */
    readonly optionSelectionChanges: Observable<KbqTreeSelectChange> = defer(() => {
        if (this.options) {
            return this.options.changes.pipe(
                startWith(this.options),
                switchMap(() => merge(...this.options.map((option) => outputToObservable(option.onSelectionChange))))
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

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;

        this.stateChanges.next();
    }

    private _placeholder: string;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);

        this.stateChanges.next();
    }

    private _required: boolean = false;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    /** When `true`, a repeated Ctrl/Cmd+A deselects all options. Off by default (Ctrl+A only selects). */
    readonly selectAllToggle = input(false, { transform: booleanAttribute });

    /**
     * Whether to render the "select all" master checkbox above the tree. Multiple selection only.
     *
     * The row acts on the nodes the user can actually toggle — enabled and selectable. Without a search
     * query that covers the whole data set, collapsed branches included; while a query is active it
     * covers only the matches. Enabling it also makes Ctrl/Cmd + A a two-way toggle, so the shortcut and
     * the checkbox never disagree (`selectAllToggle` is implied).
     */
    readonly selectAll = input(false, { transform: booleanAttribute });

    get value(): any {
        return this.tree()!.getSelectedValues();
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
        this.stateChanges.next();
    }

    private _id: string;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    private _hasBackdrop: boolean = false;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;

            if (this.parentFormField) {
                Promise.resolve().then(() => {
                    if (this._disabled) {
                        this.parentFormField.stopFocusMonitor();
                    } else {
                        this.parentFormField.runFocusMonitor();
                    }
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
        const searchInput = isInput(event) ? (event.target as HTMLInputElement) : null;

        if (shouldSelectSearchText(searchInput)) {
            searchInput!.select();
            event.preventDefault();

            return;
        }

        event.preventDefault();

        // With the master checkbox on screen the shortcut has to behave exactly like clicking it,
        // otherwise the same action would leave the checkbox showing something the selection contradicts.
        // `onSelectAll` is emitted by the tree subscription set up in `ngAfterContentInit`.
        select.tree()!.selectAllOptions(select.selectAll() || select.selectAllToggle());
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
        return this.multiple || this.multiline();
    }

    private _focused = false;

    /**
     * Minimum width of the panel.
     * If minWidth is larger than window width, it will be ignored.
     */
    readonly panelMinWidth = input<KbqPanelMinWidth, unknown>(
        this.defaultOptions?.panelMinWidth === undefined
            ? KBQ_PANEL_DEFAULT_MIN_WIDTH
            : this.defaultOptions.panelMinWidth,
        { transform: numberAttribute }
    );

    /** Origin for the overlay panel. */
    protected overlayOrigin?: CdkOverlayOrigin | ElementRef;

    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width, but will never be
     * narrower than `panelMinWidth`. If set to null or an empty string, the panel will grow to match the
     * longest option's text. Any other value is used as an exact width, and `panelMinWidth` is not applied.
     */
    readonly panelWidth = input<KbqPanelWidth>(this.defaultOptions?.panelWidth || null);

    /**
     * Maximum width of the panel in pixels. Caps how far the panel grows with its content — it never makes
     * the panel narrower than the trigger, and never clamps an explicit `panelWidth`.
     * When null, the `--kbq-panel-size-width-max` token applies.
     */
    readonly panelMaxWidth = input<KbqPanelMaxWidth, unknown>(
        this.defaultOptions?.panelMaxWidth === undefined ? null : this.defaultOptions.panelMaxWidth,
        { transform: numberAttribute }
    );

    /**
     * Maximum height of the panel's scrollable option list, in pixels. Applied as the
     * `--kbq-select-panel-size-max-height` custom property on the panel.
     *
     * The search field and the footer sit outside the scrollable area and add to the panel's total height.
     * When null, the token default (256px) applies.
     */
    readonly panelMaxHeight = input<KbqPanelMaxHeight, unknown>(
        this.defaultOptions?.panelMaxHeight === undefined ? null : this.defaultOptions.panelMaxHeight,
        { transform: numberAttribute }
    );

    /**
     * `panelMaxHeight` narrowed to the room actually available beside the trigger. Only ever clamps downward,
     * so an explicit `panelMaxHeight` stays an upper bound and is never raised to fill the viewport.
     */
    private readonly effectivePanelMaxHeight = computed<KbqPanelMaxHeight>(() => {
        const requested = this.panelMaxHeight();
        const available = this.availablePanelMaxHeight();

        if (available === null) return requested;

        return Number.isFinite(requested) ? Math.min(requested as number, available) : available;
    });

    /**
     * `panelMaxHeight` rendered as a CSS length for the `--kbq-select-panel-size-max-height` token.
     * A non-finite value (e.g. `null`) leaves the stylesheet default in place.
     * @docs-private
     */
    protected readonly panelMaxHeightToken = computed(() =>
        kbqResolvePanelMaxHeightToken(this.effectivePanelMaxHeight())
    );

    /**
     * Controls when the search functionality is displayed based on the number of available options.
     *
     * Automatically enables search hiding if value provided, even if `defaultOptions.searchMinOptionsThreshold` is provided.
     * @default undefined
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    /** Whether the overlay panel is currently on screen. Part of the `KbqSiblingPopup` contract. */
    get isAttached(): boolean {
        return this._panelOpen;
    }

    /**
     * Whether the cleaner (clear button) should be shown.
     * @docs-private
     */
    get canShowCleaner(): boolean {
        return !!this.cleaner()?.canShow;
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

    /** Subscription to everything that can change how much room the open panel has. */
    private panelSpaceSubscription = Subscription.EMPTY;

    /**
     * Cap the room around the trigger imposes on the option list, or `null` while the configured cap fits.
     * A multiline trigger grows with every selected option, so without this the panel would keep its full
     * height and get pushed out of the viewport instead of shortening.
     */
    private readonly availablePanelMaxHeight = signal<number | null>(null);

    /**
     * Height of everything in the panel that is not the option list — the trigger gap the pane pads itself
     * with, the list padding, a search field and a footer. Measured once the panel is on screen and kept
     * across opens, since it only changes when the panel gains or loses one of those parts.
     *
     * The same for every anchor: the below and overlap panes pad the top, the above pane pads the bottom, and
     * all three pad by the same gap — which is what keeps the anchor decision from feeding back into itself.
     */
    private panelChromeHeight = 0;

    /**
     * Cap the stylesheet puts on the option list, measured off the rendered panel so that a consumer
     * overriding `--kbq-select-panel-size-max-height` is sized against the height actually in force rather
     * than against the token's built-in default.
     */
    private stylesheetPanelMaxHeight = KBQ_PANEL_DEFAULT_MAX_HEIGHT;

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
    private readonly sharedResizeObserver = inject(SharedResizeObserver);
    private readonly viewportRuler = inject(ViewportRuler);
    private readonly scrollDispatcher = inject(ScrollDispatcher);

    constructor() {
        super();

        // The tree owns the "select all" row — it is the only place that can put it in front of the nodes
        // and into the key manager's list. Mirrored through an effect rather than assigned once in
        // `ngAfterContentInit` so a `[selectAll]` bound to a changing expression keeps working.
        effect(() => {
            const tree = this.tree();

            if (tree) {
                tree.selectAll = this.selectAll();
            }
        });

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        afterNextRender(() => {
            if (this.multiple && !this.multiline()) {
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

                        const search = this.search();

                        if (search) {
                            search.focus();
                        }
                    });

                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
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
        const tree = this.tree()!;

        if (!tree) return;

        tree.resetFocusedItemOnBlur = false;
        tree.optionShouldHoldFocusOnBlur = !!this.search();

        this.selectionModel = tree.selectionModel = new SelectionModel<any>(this.multiSelection);

        this.selectionModel.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.onChange(this.selectedValues);

            if (this.multiSelection) {
                this.refreshTriggerValues();
            }
        });

        this.selectionModel.changed.pipe(delay(0), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            // Refitted from here as well as from the resize observer: a multiline trigger grows with every
            // selected option, and this is the one signal guaranteed to arrive for it. A single-row trigger
            // keeps its height, so there is nothing for the refit to find.
            if (this.multiline()) {
                this.fitPanelToViewport();
            }

            this.setOverlayPosition();
        });

        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        tree.ngAfterContentInit();

        this.initKeyManager();

        this.options = tree.renderedOptions;
        tree.autoSelect = this.autoSelect;

        // Single place the event is raised, so a click on the master checkbox and Ctrl/Cmd + A — which
        // both go through `selectAllOptions` — emit exactly once and with the same payload.
        outputToObservable(tree.onSelectAll)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ options }) =>
                this.onSelectAll.emit(new KbqSelectAllEvent(this, options, tree.allOptionsSelected))
            );

        // Tree lives inside the select panel: enable hover-to-focus on options even without a
        // wrapping form-field (e.g. filter-bar pipes render the tree-select bare).
        tree.inSelect = true;

        if (tree.multipleMode === null) {
            // setTimeout need for prevent an error "NG0100: ExpressionChangedAfterItHasBeenCheckedError"
            setTimeout(() => (this.tree()!.multipleMode = this.multiSelection ? MultipleMode.CHECKBOX : null));
        }

        if (this.multiSelection) {
            tree.noUnselectLast = false;
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

        tree.selectionChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
            this.selectionChange.emit(new KbqTreeSelectChange(this, event.option, false, event.options));

            const search = this.search();

            if (search) {
                search.focus();
            }
        });

        if (!this.multiSelection) {
            this.selectionModel.changed
                .pipe(
                    filter(({ added }) => !!added.length),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe(({ added }) => {
                    this.tree()!.keyManager.setFocusOrigin('program');
                    this.tree()!.keyManager.setActiveItem(this.options.find(({ data }) => data === added[0]) as any);
                });
        }

        this.subscribeOnSearchChanges();
    }

    ngAfterViewInit() {
        const tree = this.tree()!;

        if (!tree) return;

        tree.treeControl.expansionModel.changed
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.setOverlayPosition());
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.closeSubscription.unsubscribe();
        this.panelSpaceSubscription.unsubscribe();
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

    /**
     * Clears the current selection.
     * @docs-private
     */
    clear(): void {
        this.selectionModel.clear();
        this.tree()!.keyManager.setActiveItem(-1);
        this.setSelectionByValue([]);
        this.onChange(this.selectedValues);
        this.selectionChange.emit(new KbqTreeSelectChange(this, this.selectedValues));
    }

    /**
     * Clears the current selection.
     * @deprecated Activate the projected `KbqCleaner` instead.
     * @docs-private
     */
    clearValue(event: Event): void {
        const cleaner = this.cleaner();

        if (cleaner) {
            cleaner.clear(event);
        } else {
            event.stopPropagation();
            event.preventDefault();
            this.clear();
            this.focus();
        }
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    handleClick() {
        const customMatcher = this.customMatcher();

        if (customMatcher && !customMatcher.useDefaultHandlers()) return;

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
            this.parentFormField?.getConnectedOverlayOrigin().nativeElement || this.trigger().nativeElement
        ).getBoundingClientRect();

        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(this.window.getComputedStyle(this.trigger().nativeElement)['font-size']);

        // It's important that we read this as late as possible, because doing so earlier will
        // return a different element since it's based on queries in the form field which may
        // not have run yet. Also this needs to be assigned before we measure the overlay width.
        if (this.parentFormField) {
            this.overlayOrigin = this.parentFormField.getConnectedOverlayOrigin();
        }

        this.updateOverlayWidth(this.panelWidth(), this.panelMinWidth(), this.overlayOrigin ?? this.elementRef);

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

                if (this.search()) {
                    this.lockOverlayWidthForSearch(this.panel());
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (!this._panelOpen) {
            return;
        }

        this._panelOpen = false;
        this.panelSpaceSubscription.unsubscribe();
        // Back to the configured cap, to the two default sides and to no horizontal correction, so the next
        // open is not sized for wherever the trigger used to be, nor resolved against a first row that has
        // since changed height, nor fit-tested at the offset the previous open needed.
        this.availablePanelMaxHeight.set(null);
        this.positions = this.withOverlapPosition(this.positions, null) ?? this.positions;
        this.resetOverlayOffsetX();

        this.changeDetectorRef.markForCheck();
        this.onTouched();

        const search = this.search();

        if (search) {
            search.reset();
        }
    }

    /**
     * Sets the select's value. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param value New value to be written to the model.
     */
    writeValue(value: any): void {
        if (this.tree()?.treeControl) {
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
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
        const selectedValues = this.selectionModel.selected.map((value) => this.tree()!.treeControl.getValue(value));

        return this.multiSelection ? selectedValues : selectedValues[0];
    }

    get triggerValue(): string {
        if (this.empty) {
            return '';
        }

        return this.tree()!.treeControl.getViewValue(this.selected);
    }

    get empty(): boolean {
        return !this.selectionModel || this.selectionModel.isEmpty();
    }

    isRtl(): boolean {
        return this.dir ? this.dir.value === 'rtl' : false;
    }

    get firstSelected() {
        return this.selectionModel.selected.filter((node) => !this.tree()!.treeControl.isDisabled(node))[0];
    }

    handleKeydown(event: KeyboardEvent) {
        const customMatcher = this.customMatcher();

        if (customMatcher && !customMatcher.useDefaultHandlers()) return;

        if (!this.disabled) {
            if (this.panelOpen) {
                this.panelKeydownHandler(event);
            } else {
                this.triggerKeydownHandler(event);
            }
        }
    }

    onFocus() {
        const customMatcher = this.customMatcher();

        if (customMatcher && !customMatcher.useDefaultHandlers()) return;

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
        const customMatcher = this.customMatcher();

        if (customMatcher && !customMatcher.useDefaultHandlers()) return;

        this._focused = false;

        if (!this.disabled && !this.panelOpen) {
            this.onTouched();
            this.changeDetectorRef.markForCheck();
            this.stateChanges.next();
        }
    }

    /** Callback that is invoked when the overlay panel has been attached. */
    onAttached() {
        this.overlayDir.positionChange.pipe(take(1)).subscribe(() => {
            this.changeDetectorRef.detectChanges();
            this.fitPanelToViewport();
            this.setOverlayPosition();
            // `panel` is guaranteed to exist here: this callback only fires once the overlay has attached.
            this.panel()!.nativeElement.scrollTop = this.scrollTop;

            this.tree()!.updateScrollSize();
            this.observePanelSpace();
        });

        this.closeSubscription = this.closingActions().subscribe(() => this.close());
    }

    /**
     * Sizes the option list to the room left beside the trigger, so that a trigger tall enough to leave less
     * than a panel's worth of space shortens the list instead of pushing the panel out of the viewport.
     *
     * The overlay resolves which side to open on while the panel still has its full height, so it can settle on
     * a side that cannot host the panel at all. In that case the list is sized for the roomier side and the side
     * is re-resolved — a panel sized for the roomier side is by definition too tall for the other one, so the
     * overlay lands where the space is. The side is re-resolved on exactly two other occasions: when the set of
     * positions changed, and when the first-row anchor is warranted but the pane is not on it. Anything looser
     * than that is what made the panel jump between above and below on every selection.
     *
     * The pane is repositioned either way, so that a trigger which grew without a selection change, a viewport
     * change or a scroll to move the overlay does not end up with a stale `top`.
     */
    private fitPanelToViewport(): void {
        if (!this._panelOpen || !this.overlayDir?.overlayRef) return;

        this.measurePanelChromeHeight();

        const context = this.resolvePanelSpaceContext();

        if (!context) return;

        const space = kbqResolvePanelSideSpace(context);

        if (!space) return;

        const cap = this.resolvePanelMaxHeightCap();
        const firstRowOffset = this.resolveFirstRowOffset();
        const anchorToFirstRow = kbqShouldAnchorPanelToFirstRow(context, {
            firstRowOffset,
            naturalListHeight: this.measureNaturalListHeight(),
            anchored: this.resolveOpenAnchor() === 'overlap'
        });
        const positions = this.withOverlapPosition(this.positions, anchorToFirstRow ? firstRowOffset : null);

        if (positions) {
            this.positions = positions;
            // The clamp has to come off BEFORE the overlay re-resolves. Each position is tested against the
            // pane as it is rendered right now, so a shortened panel makes the overlay settle on a side
            // that only fits while it is shortened.
            this.availablePanelMaxHeight.set(null);
            // Reaches `CdkConnectedOverlay.ngOnChanges`, which rebuilds the strategy from `positions` and
            // drops the locked position — which is what lets the anchor be re-resolved below.
            this.changeDetectorRef.detectChanges();
            this.overlayDir.overlayRef.updatePosition();
        } else if (anchorToFirstRow && this.resolveOpenAnchor() !== 'overlap') {
            // The anchor is already in `positions` but the overlay never landed on it: it is appended as soon
            // as the trigger outgrows the panel, which happens while a side may still fit, and its `offsetY`
            // is the FIRST row's height — invariant as rows 2..N pile up. So the array stops changing exactly
            // when the trigger keeps growing, and without this the side is never re-resolved again.
            this.availablePanelMaxHeight.set(null);
            this.changeDetectorRef.detectChanges();
            this.reevaluateOverlaySide();
        }

        // Read the anchor back off the pane: the overlay may have landed on any of the three.
        const openAnchor = this.resolveOpenAnchor();

        if (openAnchor === 'overlap' && firstRowOffset !== null) {
            // An overlapping panel is measured from the first row rather than from the trigger's bottom
            // edge, which is where the room it needs actually is.
            this.availablePanelMaxHeight.set(
                kbqResolveAvailablePanelMaxHeight(
                    { ...context, triggerBottom: context.triggerTop + firstRowOffset },
                    'below',
                    KBQ_PANEL_MIN_MAX_HEIGHT,
                    cap
                )
            );
            this.changeDetectorRef.detectChanges();

            return;
        }

        const side = openAnchor === 'above' ? 'above' : 'below';
        const oppositeSide = side === 'above' ? 'below' : 'above';
        const moveToOppositeSide = space[side] < KBQ_PANEL_MIN_MAX_HEIGHT && space[oppositeSide] > space[side];

        this.availablePanelMaxHeight.set(
            kbqResolveAvailablePanelMaxHeight(
                context,
                moveToOppositeSide ? oppositeSide : side,
                KBQ_PANEL_MIN_MAX_HEIGHT,
                cap
            )
        );
        this.changeDetectorRef.detectChanges();

        if (moveToOppositeSide) {
            this.reevaluateOverlaySide();
        } else {
            // Under the position lock this re-runs `reapplyLastPosition()`, which re-reads the origin rect —
            // the only thing that moves the pane after a resize that grew the trigger without a selection
            // change, a viewport change or a scroll to reposition it.
            this.overlayDir.overlayRef.updatePosition();
        }
    }

    /**
     * Distance from the origin's top edge to just below the trigger's first row, or `null` when there is no
     * row to anchor to.
     */
    private resolveFirstRowOffset(): number | null {
        const origin = this.getOverlayOriginElement();
        const list = this.multilineMatchList()?.nativeElement;

        if (!origin || !list) return null;

        const rows = Array.from(list.children, (row) => row.getBoundingClientRect());

        if (!rows.length) return null;

        const firstRowTop = Math.min(...rows.map(({ top }) => top));
        // Everything starting on the same line as the topmost item belongs to the first row, and the lowest of
        // them is what the row is worth — a custom tag template can put several elements on one row, and
        // sub-pixel layout only makes their tops equal to within a pixel.
        const firstRowBottom = Math.max(...rows.filter(({ top }) => top - firstRowTop < 1).map(({ bottom }) => bottom));
        const originRect = origin.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();

        return kbqResolveTriggerFirstRowOffset({
            originTop: originRect.top,
            originBottom: originRect.bottom,
            listTop: listRect.top,
            listBottom: listRect.bottom,
            firstRowBottom,
            // The rows keep their laid-out position when the list scrolls under `multilineMaxRows`, so the
            // scroll offset is what converts them back into the list's own coordinates.
            listScrollTop: list.scrollTop
        });
    }

    /**
     * Height the option list takes with no viewport clamp in force.
     *
     * Read from `scrollHeight`, which reports the whole content whether or not the list is currently
     * shortened — the anchor decision must not depend on the clamp it goes on to produce, or the two fight
     * each other from one resize notification to the next.
     */
    private measureNaturalListHeight(): number {
        const cap = this.resolvePanelMaxHeightCap();
        const content = this.optionsContainer();

        if (!content) return cap;

        // `clientHeight` less the computed content box is the list's own vertical padding, which
        // `scrollHeight` counts and the cap does not.
        const element = content.nativeElement;
        const padding = element.clientHeight - parseFloat(this.window.getComputedStyle(element).height);

        return Math.min(cap, element.scrollHeight - (Number.isFinite(padding) ? padding : 0));
    }

    /**
     * Cap the option list is actually rendered with: the configured `panelMaxHeight` when it is set, and the
     * stylesheet's otherwise — which a consumer can override through the token, so it is measured rather than
     * assumed. Everything that decides whether the panel fits has to be measured against this, or a taller
     * panel is judged by a shorter one's arithmetic and never gets clamped at all.
     */
    private resolvePanelMaxHeightCap(): number {
        const requestedCap = this.panelMaxHeight();

        return Number.isFinite(requestedCap) ? (requestedCap as number) : this.stylesheetPanelMaxHeight;
    }

    /** Refits the open panel when the trigger grows, the page scrolls or the viewport changes size. */
    private observePanelSpace(): void {
        const origin = this.getOverlayOriginElement();

        if (!origin) return;

        this.panelSpaceSubscription = merge(
            this.sharedResizeObserver.observe(origin),
            this.viewportRuler.change(),
            // `ancestorScrolled`, not `scrolled`: the latter is an application-global bus that every
            // `CdkScrollable` broadcasts on — the panel's own scroller included, so scrolling the option list
            // would drive the sizing pass that sizes it. Only a scroll that can actually move the trigger is
            // worth a refit.
            this.scrollDispatcher.ancestorScrolled(origin)
        )
            .pipe(debounceTime(0), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.fitPanelToViewport());
    }

    /** Geometry the panel height calculation needs, or `null` when there is nothing to measure against. */
    private resolvePanelSpaceContext(): KbqPanelSpaceContext | null {
        const origin = this.getOverlayOriginElement();

        if (!origin) return null;

        const { top, bottom } = origin.getBoundingClientRect();

        return {
            triggerTop: top,
            triggerBottom: bottom,
            // `clientHeight`, not `innerHeight`: the overlay narrows the viewport the same way, and the two
            // differ by the horizontal scrollbar — enough for a position we think fits to be rejected.
            viewportHeight: this.window.document.documentElement.clientHeight,
            viewportMargin: this.viewportMargin,
            chromeHeight: this.panelChromeHeight
        };
    }

    /** Where the panel sits relative to the trigger, read from the class the overlay applies for each position. */
    private resolveOpenAnchor(): KbqPanelAnchor {
        const { classList } = this.overlayDir.overlayRef.overlayElement;

        if (classList.contains(KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS)) return 'overlap';

        return classList.contains(KBQ_CONNECTED_OVERLAY_ABOVE_CLASS) ? 'above' : 'below';
    }

    /** Records the part of the panel that is not the option list, so that the space calculation can subtract it. */
    private measurePanelChromeHeight(): void {
        const content = this.optionsContainer();

        if (!content) return;

        const paneHeight = this.overlayDir.overlayRef.overlayElement.getBoundingClientRect().height;
        // `--kbq-select-panel-size-max-height` caps the list's *content box* — the scroller is `box-sizing:
        // initial` — so its own padding counts as chrome. The computed `height` is that content box, which is
        // exactly what the cap has to be measured against.
        const { height, maxHeight } = this.window.getComputedStyle(content.nativeElement);
        const listContentBoxHeight = parseFloat(height);
        const chromeHeight = paneHeight - listContentBoxHeight;

        if (Number.isFinite(chromeHeight) && chromeHeight >= 0) {
            this.panelChromeHeight = chromeHeight;
        }

        // Only while no clamp of ours is in force — otherwise this would read back the value we just wrote and
        // the cap would ratchet down with every refit.
        if (this.availablePanelMaxHeight() === null) {
            const stylesheetCap = parseFloat(maxHeight);

            if (Number.isFinite(stylesheetCap) && stylesheetCap > 0) {
                this.stylesheetPanelMaxHeight = stylesheetCap;
            }
        }
    }

    /** Element the overlay is positioned and sized against. */
    private getOverlayOriginElement(): HTMLElement | undefined {
        return this.parentFormField?.getConnectedOverlayOrigin().nativeElement ?? this.trigger()?.nativeElement;
    }

    /** Returns the theme to be used on the panel. */
    getPanelTheme(): string {
        return this.parentFormField ? `kbq-${this.parentFormField.color}` : '';
    }

    /** Returns the full set of classes for the panel: base class, theme and custom `panelClass`. */
    protected getPanelClasses(): string {
        const panelClass = this.panelClass();
        const classes = ['kbq-tree-select__panel', this.getPanelTheme()];

        if (typeof panelClass === 'string') {
            classes.push(panelClass);
        } else if (Array.isArray(panelClass) || panelClass instanceof Set) {
            classes.push(...panelClass);
        } else if (panelClass) {
            classes.push(...Object.keys(panelClass).filter((key) => panelClass[key]));
        }

        return classes.filter(Boolean).join(' ');
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
            this.selected.find((value) => this.tree()!.treeControl.getValue(value) === selectedOption.value)
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
            this.customTrigger() ||
            this.customMatcher() ||
            this.empty ||
            !this.multiple ||
            this.multiline()
        )
            return;

        const totalItemsWidth = this.getTotalItemsWidthInMatcher();
        const [totalVisibleItemsWidth, visibleItems] = this.getTotalVisibleItems();

        this.hiddenItems = this.selectionModel.selected.length - visibleItems;
        this.changeDetectorRef.detectChanges();

        if (this.hiddenItems) {
            const itemsCounter = this.trigger().nativeElement.querySelector('.kbq-select__match-hidden-text');
            const matcherList = this.trigger().nativeElement.querySelector('.kbq-select__match-list');

            if (!itemsCounter || !matcherList) {
                this.changeDetectorRef.markForCheck();

                return;
            }

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
        const tree = this.tree()!;

        if (isOpenKey || ((this.multiSelection || event.altKey) && isArrowKey)) {
            // prevents the page from scrolling down when pressing space
            event.preventDefault();

            this.open();
        } else if (!this.multiSelection && tree.keyManager && tree.keyManager.onKeydown) {
            tree.keyManager.onKeydown(event);
        }
    }

    panelKeydownHandler(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;

        const tree = this.tree()!;

        if ((isArrowKey && event.altKey) || keyCode === ESCAPE || keyCode === TAB) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();

            // Prevent ESCAPE from bubbling to ancestor (when inside overlay)
            if (keyCode === ESCAPE) {
                event.stopPropagation();
            }

            this.close();
            this.focus();
        } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
            this.originalOnKeyDown.call(tree, event);

            // LEFT_ARROW moves focus to the parent option when the active one is already collapsed,
            // so the search field has to be given the caret back, the same way the other keys do below.
            const search = this.search();

            if (search && this.shouldShowSearch()) {
                search.focus();
            }

            return;
        } else if (keyCode === HOME) {
            event.preventDefault();

            this.tree()!.keyManager.setFirstItemActive();
        } else if (keyCode === END) {
            event.preventDefault();

            this.tree()!.keyManager.setLastItemActive();
        } else if (keyCode === PAGE_UP) {
            event.preventDefault();

            this.tree()!.keyManager.setPreviousPageItemActive();
        } else if (keyCode === PAGE_DOWN) {
            event.preventDefault();

            this.tree()!.keyManager.setNextPageItemActive();
        } else if ((keyCode === ENTER || keyCode === SPACE) && tree.keyManager.activeItem) {
            event.preventDefault();

            if (!this.autoSelect) {
                this.originalOnKeyDown.call(tree, event);
            } else {
                this.close();
                this.focus();
            }
        } else if (this.multiSelection && isSelectAll(event)) {
            this.selectAllHandler(event, this);
        } else {
            const previouslyFocusedIndex = tree.keyManager.activeItemIndex;

            tree.keyManager.setFocusOrigin('keyboard');
            tree.keyManager.onKeydown(event);

            if (
                this.multiSelection &&
                isArrowKey &&
                event.shiftKey &&
                tree.keyManager.activeItem &&
                tree.keyManager.activeItemIndex !== previouslyFocusedIndex
            ) {
                tree.keyManager.activeItem.selectViaInteraction(event);
            }

            if (this.autoSelect && tree.keyManager.activeItem) {
                tree.setSelectedOptionsByKey(
                    tree.keyManager.activeItem,
                    hasModifierKey(event, 'shiftKey'),
                    // ctrlKey is for Windows, metaKey is for MacOS
                    hasModifierKey(event, 'ctrlKey', 'metaKey')
                );
            }

            // Ensure the active option's keyboard-focus indicator is shown even when the
            // index didn't change (e.g. ArrowDown on a single-option list) — without this
            // setActiveItem isn't invoked and the focus stays on the trigger.
            if (isArrowKey && tree.keyManager.activeItemIndex === previouslyFocusedIndex) {
                tree.keyManager.activeItem?.focus('keyboard');
            }

            const search = this.search();

            if (search && this.shouldShowSearch()) {
                search.focus();
            }
        }
    }

    /** @docs-private */
    protected shouldShowSearch(): boolean {
        // `options`/`renderedOptions` leads with the "select all" row when it is on, and the row is
        // added to it on a separate, later-processed reactive pass than the one behind `nodesCount` —
        // reading the tree's own authoritative node count instead of subtracting from `options.length`
        // sidesteps that race entirely, rather than risking the two going momentarily out of step.
        const optionsCount = this.tree()?.nodesCount ?? this.options.length;

        return (
            isUndefined(this.searchMinOptionsThreshold) ||
            !!this.search()?.value() ||
            optionsCount >= this.searchMinOptionsThreshold
        );
    }

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
        this.renderer.appendChild(this.trigger().nativeElement, triggerClone);

        let totalItemsWidth: number = 0;
        const selectedItemsViewValueContainers = triggerClone.querySelectorAll<HTMLElement>('kbq-tag');

        selectedItemsViewValueContainers.forEach((item) => (totalItemsWidth += this.getItemWidth(item)));

        triggerClone.remove();

        return totalItemsWidth;
    }

    private getTotalVisibleItems(): [number, number] {
        const triggerClone = this.buildTriggerClone();

        const hiddenText = triggerClone.querySelector('.kbq-select__match-hidden-text');

        if (hiddenText) {
            this.renderer.setStyle(hiddenText, 'display', 'block');
        }

        this.renderer.appendChild(this.trigger().nativeElement, triggerClone);

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
        const triggerClone = this.trigger().nativeElement.cloneNode(true);

        this.renderer.setStyle(triggerClone, 'position', 'absolute');
        this.renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this.renderer.setStyle(triggerClone, 'top', '-100%');
        this.renderer.setStyle(triggerClone, 'left', '0');

        return triggerClone;
    }

    /**
     * Width of a single `kbq-tag` in the matcher, including margins and the inter-tag gap.
     *
     * Tags are `border-box` and carry horizontal padding, which `getComputedStyle().width` — always
     * the used content-box width — leaves out. See the twin in `KbqSelect`.
     */
    private getItemWidth(element: HTMLElement): number {
        const computedStyle = this.window.getComputedStyle(element);

        const width: number = element.getBoundingClientRect().width;
        const marginLeft: number = parseFloat(computedStyle.marginLeft as string) || 0;
        const marginRight: number = parseFloat(computedStyle.marginRight as string) || 0;

        return width + marginLeft + marginRight + parseInt(SelectSizeMultipleContentGap);
    }

    private refreshTriggerValues(): void {
        this.triggerValues = this.selectionModel.selected.map((node) => ({
            value: this.tree()!.treeControl.getValue(node),
            viewValue: this.tree()!.treeControl.getViewValue(node),
            disabled: this.tree()!.treeControl.isDisabled(node)
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

            this.tree()!.setOptionsFromValues(value);

            this.sortValues();
        } else {
            this.tree()!.setOptionsFromValues([value]);
        }

        this.changeDetectorRef.detectChanges();
    }

    private initKeyManager() {
        const tree = this.tree()!;

        this.originalOnKeyDown = tree.onKeyDown;

        tree.onKeyDown = () => {};

        tree.keyManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            const treeValue = this.tree()!;

            if (this._panelOpen && this.panel()) {
                this.scrollActiveOptionIntoView();
            } else if (!this._panelOpen && !this.multiSelection && treeValue.keyManager.activeItem) {
                treeValue.keyManager.activeItem.selectViaInteraction();
            }
        });
    }

    /** Sorts the selected values in the selected based on their order in the panel. */
    private sortValues() {
        if (this.multiSelection) {
            const options = this.options.toArray();

            this.selectionModel.sort((a, b) => {
                const sortComparator = this.sortComparator();

                return sortComparator ? sortComparator(a, b, options) : options.indexOf(a) - options.indexOf(b);
            });

            this.stateChanges.next();
        }
    }

    /**
     * Highlights the selected item. If no option is selected, it will highlight
     * the first item instead.
     */
    private highlightCorrectOption() {
        const tree = this.tree()!;

        if (!tree.keyManager) {
            return;
        }

        const selectedOption = this.options.find((option) => (option.data as any) === this.firstSelected);

        tree.keyManager.setFocusOrigin('keyboard');

        if (selectedOption) {
            tree.keyManager.setActiveItem(selectedOption);
        } else {
            tree.keyManager.setFirstItemActive();

            if (tree.keyManager.activeItem?.disabled) {
                tree.keyManager.setActiveItem(-1);
            }
        }
    }

    /** Scrolls the active option into view. */
    private scrollActiveOptionIntoView() {
        this.tree()!.keyManager.activeItem?.focus();
    }

    private subscribeOnSearchChanges() {
        const search = this.search();

        if (!search?.ngControl?.valueChanges) return;

        search.ngControl.valueChanges
            .pipe(
                audit(() => this.tree()!.unorderedOptions.changes),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((value) => {
                this.isEmptySearchResult = !!value && this.tree()!.isEmpty;
                this.changeDetectorRef.markForCheck();
            });
    }
}
