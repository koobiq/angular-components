import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Platform, _getEventTarget } from '@angular/cdk/platform';
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
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KBQ_PARENT_POPUP,
    KBQ_SELECT_LOCALE_CONFIGURATION,
    KBQ_SELECT_SCROLL_STRATEGY,
    KbqAbstractSelect,
    KbqComponentColors,
    KbqPanelMaxHeight,
    KbqPanelMaxWidth,
    KbqPanelMinWidth,
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
    kbqResolvePanelMaxHeightToken,
    kbqSelectAnimations,
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
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqTag, KbqTagRemove } from '@koobiq/components/tags';
import { KbqTreeOption, KbqTreeSelection } from '@koobiq/components/tree';
import { SizeXxs as SelectSizeMultipleContentGap } from '@koobiq/design-tokens';
import { Observable, Subject, Subscription, audit, defer, fromEvent, merge, timer } from 'rxjs';
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
export class KbqTreeSelectChange<T = any> {
    constructor(
        /** Select the change comes from. */
        public source: KbqTreeSelect,
        /**
         * Option the change is about — a `KbqTreeOption` whenever the changed node is rendered, and the
         * raw value of the node when it is not. `null` when the change is not about a single option,
         * which today means the whole selection was cleared.
         */
        public value: T,
        /** Whether the change was made by the user rather than written to the model. */
        public isUserInput = false,
        /** Every option the change is about, when it covers more than one. */
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
        KbqScrollbarViewport,
        NgTemplateOutlet
    ],
    templateUrl: 'tree-select.html',
    styleUrls: ['./tree-select.scss', './tree-select-tokens.scss'],
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
        // The tree-select is not a native control, so its combobox semantics, its accessible name and
        // its invalid/required/disabled states all have to be exposed explicitly.
        //
        // No `aria-haspopup` here: the panel carries no `role="tree"` yet, and announcing a popup that
        // the assistive technology then cannot find is worse than announcing none — the same call
        // `KbqDropdownTrigger` made. Add it together with the tree roles.
        role: 'combobox',
        '[attr.id]': 'id',
        '[attr.aria-expanded]': 'panelOpen',
        '[attr.aria-controls]': 'panelOpen ? panelId : null',
        '[attr.aria-activedescendant]': 'activeDescendantId',
        '[attr.aria-labelledby]': 'ariaLabelledby()',
        '[attr.aria-invalid]': 'errorState',
        '[attr.aria-required]': 'required',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        '(click)': 'handleClick()',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    },
    animations: [
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
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly ngZone = inject(NgZone);
    private readonly renderer = inject(Renderer2);
    defaultErrorStateMatcher = inject(ErrorStateMatcher);
    private readonly scrollStrategyFactory = inject(KBQ_SELECT_SCROLL_STRATEGY);
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

    /** Number of the selected items that do not fit into the trigger. */
    readonly hiddenItems = signal(0);

    /** The last measured value for the trigger's client bounding rect. */
    protected triggerRect: DOMRect;

    /** The cached font-size of the trigger element. */
    triggerFontSize = 0;

    /** Deals with the selection logic. */
    selectionModel: SelectionModel<any>;

    /** Emits when the panel element is finished transforming in. */
    protected readonly panelDoneAnimatingStream = new Subject<string>();

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
     * Opens the panel below the trigger, falling back to above it when it does not fit.
     *
     * A third position is appended at runtime by `updatePanelAnchor`: a multiline trigger that has grown
     * taller than the panel gets it anchored to its first row and drawn over the rest of it.
     */
    protected readonly positions: ConnectedPosition[] = [
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

    protected options: QueryList<KbqTreeOption>;

    /**
     * Trigger - is a clickable field to open select dropdown panel
     */
    readonly trigger = viewChild.required<ElementRef>('trigger');

    /** Reference to the overlay panel element. */
    readonly panel = viewChild<ElementRef>('panel');

    /** Scrollable option list inside the panel. */
    protected readonly optionsContainer = viewChild<ElementRef<HTMLElement>>('optionsContainer');

    /** The options container's custom scrollbar viewport, flashed when the panel opens. */
    private readonly scrollbarViewport = viewChild(KbqScrollbarViewport);

    @ViewChild(CdkConnectedOverlay, { static: false }) protected overlayDir: CdkConnectedOverlay;

    @ViewChildren(KbqTag) protected tags: QueryList<KbqTag>;

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

    /**
     * Text of the counter of the selected items that do not fit into the trigger. `{{ number }}` is
     * replaced with their number.
     *
     * Left unset, the text follows the active locale (`select.hiddenItemsText`); set, it wins over the
     * locale and survives a locale change.
     */
    readonly hiddenItemsText = input<string | undefined>(undefined);

    /** Formats the counter of the items that do not fit into the trigger. */
    readonly hiddenItemsTextFormatter = input<(hiddenItemsText: string, hiddenItems: number) => string>(
        (hiddenItemsText, hiddenItems) => hiddenItemsText.replace('{{ number }}', hiddenItems.toString())
    );

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

    /**
     * Id of the element that names the control.
     *
     * A `role="combobox"` element is announced unnamed without one, and the `<label for>` a wrapping
     * `kbq-form-field` renders does not name it either — `for` only names labelable elements, which a
     * custom control is not. Until the form field labels its control explicitly, this input (or a plain
     * `aria-label` attribute, which the component never overwrites) is how the control gets a name.
     */
    readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

    /** Object used to control when error messages are shown. */
    // Stays a decorator input: `CanUpdateErrorState` declares it as a plain property.
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

    // Stays an accessor: `KbqFormFieldControl` declares `placeholder` as a plain string property.
    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;

        this.stateChanges.next();
    }

    private _placeholder: string;

    // Stays an accessor: `KbqFormFieldControl` declares `required` as a plain boolean property.
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);

        this.stateChanges.next();
    }

    private _required: boolean = false;

    // Stays an accessor: the setter refuses a change once the selection model exists.
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

    // Stays an accessor: the getter is not a mirror of the input — multiple selection forces it off.
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

    // Stays an accessor: `KbqFormFieldControl` declares `id` as a plain string property, and the form
    // field's label points at it.
    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
        this.stateChanges.next();
    }

    private _id: string;

    /** Whether the overlay panel is rendered on top of a backdrop. */
    readonly hasBackdrop = input(false, { transform: booleanAttribute });

    // Stays an accessor: the getter is not a mirror of the input — a disabled select reports -1.
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

    // Stays an accessor: `KbqFormFieldControl` declares `disabled` as a plain boolean property, and the
    // setter starts and stops the parent form field's focus monitor.
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
    // Stays an accessor: the setter rejects a non-function.
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
     * `panelMaxHeight` rendered as a CSS length for the `--kbq-select-panel-size-max-height` token.
     * A non-finite value (e.g. `null`) leaves the stylesheet default in place.
     * @docs-private
     */
    protected readonly panelMaxHeightToken = computed(() => kbqResolvePanelMaxHeightToken(this.panelMaxHeight()));

    /**
     * Controls when the search functionality is displayed based on the number of available options.
     *
     * Automatically enables search hiding if value provided, even if `defaultOptions.searchMinOptionsThreshold` is provided.
     * @default undefined
     */
    // Stays an accessor: the setter resolves `'auto'` and the token default into a number.
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

    /**
     * Colour of the trigger's tags and arrow.
     *
     * A `computed()` rather than a getter: it used to read the host's class list on every change
     * detection pass, twice per pass, through the two template bindings that consume it.
     * @docs-private
     */
    readonly colorForState = computed<KbqComponentColors>(() =>
        this.invalidState() ? KbqComponentColors.Error : KbqComponentColors.ContrastFade
    );

    /** Full set of classes for the panel: base class, form-field theme and custom `panelClass`. */
    protected readonly panelClasses = computed<string>(() => {
        const panelClass = this.panelClass();
        const formFieldColor = this.formFieldColor();
        const classes = ['kbq-tree-select__panel', formFieldColor ? `kbq-${formFieldColor}` : ''];

        if (typeof panelClass === 'string') {
            classes.push(panelClass);
        } else if (Array.isArray(panelClass) || panelClass instanceof Set) {
            classes.push(...panelClass);
        } else if (panelClass) {
            classes.push(...Object.keys(panelClass).filter((key) => panelClass[key]));
        }

        return classes.filter(Boolean).join(' ');
    });

    /** Text of the counter of the items that do not fit into the trigger. */
    protected readonly hiddenItemsLabel = computed<string>(() =>
        this.hiddenItemsTextFormatter()(
            this.hiddenItemsText() ?? this.localeConfiguration().hiddenItemsText,
            this.hiddenItems()
        )
    );

    /**
     * Id of the option the keyboard is on, announced by the combobox instead of moving the reading
     * cursor into the panel. Only meaningful while the panel is on screen.
     * @docs-private
     */
    protected get activeDescendantId(): string | null {
        return this.panelOpen ? (this.tree()?.keyManager?.activeItem?.id ?? null) : null;
    }

    isEmptySearchResult: boolean;

    triggerValues: KbqTreeSelectTriggerValue[] = [];

    private closeSubscription = Subscription.EMPTY;

    private _panelOpen = false;

    /** The scroll offset the panel is restored to when it attaches — the list always opens at the top. */
    private scrollTop = 0;

    /** Unique id for this input. */
    private readonly uid = `kbq-tree-select-${nextUniqueId++}`;

    /** Id of the overlay panel, referenced by the host's `aria-controls`. */
    protected readonly panelId = `${this.uid}-panel`;

    /**
     * Whether projected content has been resolved. The search field reaches its form control through
     * its own form field, and that is only guaranteed to have been wired by `ngAfterContentInit`.
     */
    private readonly contentInitialized = signal(false);

    /** Reactive mirror of the state the error colour is derived from. */
    private readonly invalidState = signal(false);

    /** Reactive mirror of the wrapping form field's colour, which is a plain input on `KbqColorDirective`. */
    private readonly formFieldColor = signal<string | undefined>(this.parentFormField?.color);

    // Used for storing the values that were assigned before the options were initialized.
    private tempValues: string | string[] | null;

    /** Handles of the timers that outlive the call that scheduled them. */
    private readonly pendingTimers = new Set<ReturnType<typeof setTimeout>>();

    private readonly destroyRef = inject(DestroyRef);

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

        // `search` is projected content and can come and go with an `@if`, so both the wiring that
        // follows it and the flag the tree reads on blur have to be re-applied, not read once.
        // Gated on content init because the search reaches its control through its own form field,
        // which is only guaranteed to have resolved by then.
        effect((onCleanup) => {
            const tree = this.tree();
            const search = this.search();

            if (!tree || !this.contentInitialized()) return;

            tree.optionShouldHoldFocusOnBlur = !!search;

            if (!search) return;

            const subscription = this.subscribeOnSearchChanges(tree, search);

            onCleanup(() => subscription?.unsubscribe());
        });

        this.destroyRef.onDestroy(() => {
            this.pendingTimers.forEach(clearTimeout);
            this.pendingTimers.clear();
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
                    this.scheduleTimeout(() => {
                        this.highlightCorrectOption();

                        const search = this.search();

                        if (search) {
                            search.focus();
                        }
                    });

                    this.scrollbarViewport()?.flashScrollIndicators();

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

        // The two values below are read through plain properties — `KbqColorDirective.color` is a
        // decorator input, and the legacy `kbqValidate` directive marks the host with a class. Mirroring
        // them here is what lets everything derived from them be a `computed()` instead of a getter
        // re-evaluated by every binding on every pass.
        this.formFieldColor.set(this.parentFormField?.color);
        this.invalidState.set(this.hasLegacyValidateDirective() ? !!this.ngControl?.invalid : this.errorState);
    }

    ngAfterContentInit() {
        const tree = this.tree()!;

        if (!tree) return;

        tree.resetFocusedItemOnBlur = false;

        this.selectionModel = new SelectionModel<any>(this.multiSelection);

        this.selectionModel.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.onChange(this.selectedValues);

            if (this.multiSelection) {
                this.refreshTriggerValues();
            }
        });

        this.selectionModel.changed.pipe(delay(0), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            // A multiline trigger grows with every selected option, and this is the one signal guaranteed
            // to arrive for it. A single-row trigger keeps its height, so there is nothing to re-anchor.
            this.updatePanelAnchor();
            this.setOverlayPosition();
        });

        // Hands the tree the model this component owns. Re-running `tree.ngAfterContentInit()` was the
        // old way of doing it and left the tree with a second set of subscribers on query lists that are
        // never re-created — every options change handled twice, for the lifetime of the component.
        tree.initializeForEmbedding(this.selectionModel);

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
            // Deferred to prevent an "NG0100: ExpressionChangedAfterItHasBeenCheckedError".
            this.scheduleTimeout(() => (tree.multipleMode = this.multiSelection ? MultipleMode.CHECKBOX : null));
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

            // Guarded the same way every other refocus in the component is: with the field hidden by
            // `searchMinOptionsThreshold` there is nothing to give the caret back to.
            if (search && this.shouldShowSearch()) {
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

        this.contentInitialized.set(true);
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
        this.panelDoneAnimatingStream.complete();
        this.openedChange.complete();
        this.closeSubscription.unsubscribe();
        this.unsubscribeFromPanelResize();
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

    /**
     * Clears the current selection.
     * @docs-private
     */
    clear(): void {
        this.selectionModel.clear();
        this.tree()!.keyManager.setActiveItem(-1);

        // The model above is the tree's own, so it is already empty — this only resets what the tree
        // keeps outside it. Going through `setSelectionByValue([])` instead would reach the same place
        // by asking the tree to select the matches of `[[]]`, of which there are none.
        this.tree()!.setOptionsFromValues([]);
        this.changeDetectorRef.detectChanges();

        this.onChange(this.selectedValues);
        this.selectionChange.emit(new KbqTreeSelectChange(this, null, false, []));
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

    /** Host click handler. A custom matcher that opts out of the default handlers takes it over. */
    protected handleClick() {
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
        this.unsubscribeFromPanelResize();
        // Back to the two default sides, so the next open is not resolved against a first row that has since
        // changed height.
        this.positions = this.withOverlapPosition(this.positions, null) ?? this.positions;

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
    registerOnTouched(fn: () => void) {
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

    /** First selected node that is not disabled — the one the panel highlights when it opens. */
    protected get firstSelected() {
        return this.selectionModel.selected.filter((node) => !this.tree()!.treeControl.isDisabled(node))[0];
    }

    /**
     * Host keydown handler, routing the event to the trigger or the panel handler. A custom matcher
     * that opts out of the default handlers reaches those two directly instead.
     */
    protected handleKeydown(event: KeyboardEvent) {
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
            this.setOverlayPosition();
            // The panel itself is an `overflow: hidden` box; the option list is what scrolls.
            this.optionsContainer()!.nativeElement.scrollTop = this.scrollTop;

            this.tree()!.updateScrollSize();
            // Deliberately out of this frame — see `reanchorPanel`. A microtask still lands before paint.
            queueMicrotask(() => this.reanchorPanel());
        });

        this.subscribeToPanelResize();

        // This runs on every open, so without dropping the previous subscription every open would add
        // another one and a single outside click would call `close()` once per open so far.
        this.closeSubscription.unsubscribe();
        this.closeSubscription = this.closingActions().subscribe(() => this.close());
    }

    /** Element the overlay is positioned and sized against. */
    protected getOverlayOriginElement(): HTMLElement | undefined {
        return this.parentFormField?.getConnectedOverlayOrigin().nativeElement ?? this.trigger()?.nativeElement;
    }

    protected isPanelOpen(): boolean {
        return this._panelOpen;
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

    /** Removes an option from the selection through the trailing icon of its tag in the trigger. */
    onRemoveSelectedOption(selectedOption: KbqTreeSelectTriggerValue, $event: Event): void {
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

    /**
     * Recounts the tags of the trigger that do not fit on its first line and refreshes the "+N"
     * counter. Runs on window resize and whenever the rendered tags change.
     * @docs-private
     */
    protected calculateHiddenItems = () => {
        if (
            !this.isBrowser ||
            this.customTrigger() ||
            this.customMatcher() ||
            this.empty ||
            !this.multiple ||
            this.multiline()
        )
            return;

        const { totalItemsWidth, totalVisibleItemsWidth, visibleItems } = this.measureMatcherItems();

        this.hiddenItems.set(this.selectionModel.selected.length - visibleItems);
        this.changeDetectorRef.detectChanges();

        if (this.hiddenItems()) {
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
                this.hiddenItems.set(0);
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

        if ((isArrowKey && event.altKey) || keyCode === ESCAPE) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();

            // Prevent ESCAPE from bubbling to ancestor (when inside overlay)
            if (keyCode === ESCAPE) {
                event.stopPropagation();
            }

            this.close();
            this.focus();
        } else if (keyCode === TAB) {
            // Deliberately not `preventDefault`-ed. Closing the panel and pulling the focus back to the
            // host is all this control has to do; the browser then moves on to the next control the way
            // Tab always does. Swallowing the key trapped the focus inside an open select.
            this.close();
            this.focus();
        } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
            tree.handleKeydown(event);

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
                tree.handleKeydown(event);
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

    /**
     * Runs `callback` after the current task, keeping the handle so that destroying the component
     * cancels it. A timer left to fire after teardown runs against a component that is already gone.
     */
    private scheduleTimeout(callback: () => void): void {
        const handle = setTimeout(() => {
            this.pendingTimers.delete(handle);
            callback();
        });

        this.pendingTimers.add(handle);
    }

    /**
     * Whether the host is marked by the legacy `kbqValidate` directive, which reports validity through
     * `ngControl` instead of through the form field's error state.
     */
    private hasLegacyValidateDirective(): boolean {
        return this.elementRef.nativeElement.classList.contains('kbq-control_has-validate-directive');
    }

    private closingActions() {
        const backdrop = this.overlayDir.overlayRef!.backdropClick();
        const outsidePointerEvents = this.overlayDir
            .overlayRef!.outsidePointerEvents()
            .pipe(filter((event) => !this.elementRef.nativeElement.contains(_getEventTarget(event))));
        const detachments = this.overlayDir.overlayRef!.detachments();

        return merge(backdrop, outsidePointerEvents, detachments);
    }

    /**
     * Measures the tags of the matcher on an off-screen copy of the trigger.
     *
     * Two answers are needed — how many tags fit on the first line next to the "+N" counter, and how
     * wide all of them are together — and they used to cost a clone each. One clone is enough: it is
     * built, appended and removed once, and the only thing separating the two passes is the counter,
     * which the second pass drops from the copy.
     */
    private measureMatcherItems(): { totalItemsWidth: number; totalVisibleItemsWidth: number; visibleItems: number } {
        const triggerClone = this.buildTriggerClone();
        const hiddenText = triggerClone.querySelector('.kbq-select__match-hidden-text');

        if (hiddenText) {
            this.renderer.setStyle(hiddenText, 'display', 'block');
        }

        this.renderer.appendChild(this.trigger().nativeElement, triggerClone);

        let totalVisibleItemsWidth: number = 0;
        let visibleItems: number = 0;

        triggerClone.querySelectorAll<HTMLElement>('kbq-tag').forEach((item) => {
            if (item.offsetTop < item.offsetHeight) {
                totalVisibleItemsWidth += this.getItemWidth(item);
                visibleItems++;
            }
        });

        hiddenText?.remove();

        let totalItemsWidth: number = 0;

        triggerClone
            .querySelectorAll<HTMLElement>('kbq-tag')
            .forEach((item) => (totalItemsWidth += this.getItemWidth(item)));

        triggerClone.remove();

        return { totalItemsWidth, totalVisibleItemsWidth, visibleItems };
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

        // The select routes every key itself and calls back into `tree.handleKeydown` for the parts it
        // delegates, so the tree must not also act on the same event from its own host listener.
        tree.ownsKeyboard = false;

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

    private scrollActiveOptionIntoView() {
        this.tree()!.keyManager.activeItem?.focus();
    }

    /**
     * Keeps `isEmptySearchResult` in step with the search field.
     *
     * The flag is read back once the tree has had the chance to re-render for the new query. Waiting on
     * the rendered set alone is not enough: a query that filters nothing out leaves the option list —
     * and therefore its `changes` — silent, and the flag kept answering for the query before it. The
     * timer is the floor that covers that case.
     */
    private subscribeOnSearchChanges(tree: KbqTreeSelection, search: KbqSelectSearch): Subscription | undefined {
        const ngControl = search.ngControl;
        const valueChanges = ngControl?.valueChanges;

        if (!ngControl || !valueChanges) return;

        // Seeded rather than piped through `startWith`, which would open the gate below — and with it a
        // timer — before the user has typed anything.
        this.isEmptySearchResult = !!ngControl.value && tree.isEmpty;

        return valueChanges.pipe(audit(() => merge(tree.unorderedOptions.changes, timer(0)))).subscribe((value) => {
            this.isEmptySearchResult = !!value && tree.isEmpty;
            this.changeDetectorRef.markForCheck();
        });
    }
}
