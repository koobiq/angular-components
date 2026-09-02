import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition, OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
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
    contentChildren,
    effect,
    inject,
    input,
    numberAttribute,
    output,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    ActiveDescendantKeyManager,
    BACKSPACE,
    CanUpdateErrorState,
    DELETE,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    ErrorStateMatcher,
    HOME,
    KBQ_CONNECTED_OVERLAY_ABOVE_CLASS,
    KBQ_CONNECTED_OVERLAY_BELOW_CLASS,
    KBQ_OPTION_PARENT_COMPONENT,
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KBQ_PARENT_POPUP,
    KBQ_SELECT_LOCALE_CONFIGURATION,
    KBQ_SELECT_SCROLL_STRATEGY,
    KbqAbstractSelect,
    KbqComponentColors,
    KbqOptgroup,
    KbqOption,
    KbqOptionBase,
    KbqOptionSelectionChange,
    KbqPanelMaxHeight,
    KbqPanelMaxWidth,
    KbqPanelMinWidth,
    KbqPanelWidth,
    KbqPseudoCheckbox,
    KbqPseudoCheckboxState,
    KbqSelectAllAdapter,
    KbqSelectAllEvent,
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectSearchEmptyResult,
    KbqSelectTrigger,
    KbqSiblingPopup,
    KbqVirtualOption,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW,
    defaultOffsetY,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    getKbqSelectNonFunctionValueError,
    getSelectAllState,
    isInput,
    isSelectAll,
    isUndefined,
    kbqInjectLocaleConfiguration,
    kbqResolvePanelMaxHeightToken,
    kbqSelectAnimations,
    kbqSiblingPopupProvider,
    runCompareWith,
    shouldSelectSearchText,
    toggleSelectAll
} from '@koobiq/components/core';
import {
    KBQ_FORM_FIELD,
    KbqCleaner,
    KbqFormFieldControl,
    kbqCleanerFactoryProvider
} from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KBQ_SCROLLBAR_OPTIONS, KbqScrollbarViewport, type KbqScrollbarMode } from '@koobiq/components/scrollbar';
import { KbqTag } from '@koobiq/components/tags';
import { SizeXxs as SelectSizeMultipleContentGap } from '@koobiq/design-tokens';
import { BehaviorSubject, EMPTY, Observable, Subject, Subscription, defer, fromEvent, merge } from 'rxjs';
import {
    auditTime,
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

const SCROLLED_TO_BOTTOM_THROTTLE_TIME = 100;

/** Change event object that is emitted when the select value has changed. */
export class KbqSelectChange {
    constructor(
        public source: KbqSelect,
        public value: any
    ) {}
}

/**
 * Select panel width type.
 * @deprecated Use `KbqPanelWidth` from `@koobiq/components/core` instead.
 */
export type KbqSelectPanelWidth = KbqPanelWidth;

/** Options for the `kbq-select` that can be configured using the `KBQ_SELECT_OPTIONS` injection token. */
export type KbqSelectOptions = Partial<{
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

/** Injection token that can be used to provide the default options for the `kbq-select`. */
export const KBQ_SELECT_OPTIONS = new InjectionToken<KbqSelectOptions>('KBQ_SELECT_OPTIONS');

/** Utility provider for `KBQ_SELECT_OPTIONS`. */
export const kbqSelectOptionsProvider = (options: KbqSelectOptions): Provider => {
    return {
        provide: KBQ_SELECT_OPTIONS,
        useValue: options
    };
};

/** Delay in milliseconds before displaying a result when there are no options. */
export const delayBeforeDisplayingResultWithoutOptions = 101;
/** Minimum time in milliseconds to display the loading state. */
export const minimumTimeToDisplayLoading = 300;

@Component({
    selector: 'kbq-select',
    imports: [
        CdkOverlayOrigin,
        KbqTag,
        NgTemplateOutlet,
        CdkMonitorFocus,
        CdkConnectedOverlay,
        KbqIconModule,
        KbqOption,
        KbqPseudoCheckbox,
        KbqScrollbarViewport
    ],
    templateUrl: 'select.html',
    styleUrls: ['./select.scss', './select-tokens.scss'],
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqSelect },
        kbqCleanerFactoryProvider(() => {
            const select = inject(KbqSelect);

            return {
                get control() {
                    return select;
                },
                get keydownTarget() {
                    return select.elementRef.nativeElement;
                },
                clearByEscape: false,
                clear: () => select.clear()
            };
        }),
        { provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqSelect },
        { provide: KBQ_PARENT_POPUP, useExisting: KbqSelect },
        kbqSiblingPopupProvider(KbqSelect)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        // The select is not a native control, so the invalid and required states have to be exposed explicitly.
        '[attr.aria-invalid]': 'errorState',
        '[attr.aria-required]': 'required',
        class: 'kbq-select',
        '[class.kbq-select_multiple]': 'multiple',
        '[class.kbq-select_multiline]': 'multiline()',
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
    exportAs: 'kbqSelect'
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
        CanUpdateErrorState,
        KbqSiblingPopup
{
    private readonly _changeDetectorRef = inject(ChangeDetectorRef);
    private readonly _ngZone = inject(NgZone);
    private readonly _renderer = inject(Renderer2);
    defaultErrorStateMatcher = inject(ErrorStateMatcher);
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private overlayContainer = inject(OverlayContainer);
    private readonly _dir = inject(Directionality, { optional: true });
    parentForm = inject(NgForm, { optional: true });
    parentFormGroup = inject(FormGroupDirective, { optional: true });
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { host: true, optional: true })!;
    ngControl = inject(NgControl, { self: true, optional: true });
    private readonly scrollStrategyFactory = inject(KBQ_SELECT_SCROLL_STRATEGY);

    /** Localized strings of the select, following the active locale. */
    private readonly localeConfiguration = kbqInjectLocaleConfiguration('select', KBQ_SELECT_LOCALE_CONFIGURATION);

    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);

    protected readonly isBrowser = inject(Platform).isBrowser;

    protected readonly defaultOptions = inject(KBQ_SELECT_OPTIONS, { optional: true });
    private readonly scrollbarOptions = inject(KBQ_SCROLLBAR_OPTIONS);

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

    /** The cached font-size of the trigger element in pixels. */
    triggerFontSize = 0;

    /** Deals with the selection logic. Manages selected options and their states. */
    selectionModel: SelectionModel<KbqOptionBase>;

    /** Previously selected options before the current selection was made. */
    previousSelectionModelSelected: KbqOptionBase[] = [];

    /**
     * Detached copies of the selected options, captured while the option was still rendered.
     * `cdk-virtual-scroll` recycles option views, so a `KbqOption` kept in `selectionModel` can
     * silently start carrying another item's value and label — the copy preserves the original ones.
     */
    private readonly selectedOptionCopies = new WeakMap<KbqOptionBase, KbqVirtualOption>();

    /** Manages keyboard events for options in the panel. */
    keyManager: ActiveDescendantKeyManager<KbqOption>;

    /** The value of the select panel's transform-origin property for animations. */
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
     * Opens the panel below the trigger, falling back to above it when it does not fit.
     *
     * A third position is appended at runtime by `updatePanelAnchor`: a multiline trigger that has grown
     * taller than the panel gets it anchored to its first row and drawn over the rest of it.
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

    /**
     * Trigger - is a clickable field to open select dropdown panel
     */
    readonly trigger = viewChild<ElementRef>('trigger');

    /** Reference to the overlay panel element. */
    readonly panel = viewChild<ElementRef>('panel');

    /** Reference to the container element that holds the options. */
    readonly optionsContainer = viewChild.required<ElementRef>('optionsContainer');

    private readonly scrollbarViewport = viewChild(KbqScrollbarViewport);

    // Virtual scroll projects its own viewport, which is the actual scrolling element.
    private readonly projectedScrollbarViewport = contentChild(KbqScrollbarViewport, { descendants: true });

    /** Reference to the built-in "select all" row, rendered only while `selectAll` is on. */
    readonly selectAllOption = viewChild(KbqOption);

    /** Reference to the CDK connected overlay directive. */
    @ViewChild(CdkConnectedOverlay, { static: false }) overlayDir: CdkConnectedOverlay;

    /** Reference to the optional footer element in the panel. */
    readonly footer = contentChild(KbqSelectFooter, { read: ElementRef });

    /** Reference to the CDK virtual scroll directive for virtual scrolling support. */
    readonly cdkVirtualForOf = contentChild(CdkVirtualForOf);

    /** Reference to the CDK virtual scroll viewport for tracking scroll position in virtual mode. */
    readonly virtualScrollViewport = contentChild(CdkVirtualScrollViewport);

    /** Query list of tags displayed in multiple selection mode. */
    @ViewChildren(KbqTag) tags: QueryList<KbqTag>;

    /** User-supplied override of the trigger element for custom rendering. */
    readonly customTrigger = contentChild(KbqSelectTrigger);

    /** User-supplied matcher component for custom value matching logic. */
    readonly customMatcher = contentChild(KbqSelectMatcher);

    /** Custom template reference for rendering tag content. */
    readonly customTagTemplateRef = contentChild('kbqSelectTagContent', { read: TemplateRef });

    /**
     * Reference to the optional cleaner element for clearing selection.
     * @docs-private
     */
    readonly cleaner = contentChild(KbqCleaner, { descendants: false });

    /** All of the defined select options. */
    @ContentChildren(KbqOption, { descendants: true }) options: QueryList<KbqOption>;

    /**
     * Everything the key manager navigates: the built-in "select all" row first, then `options`.
     *
     * The row is rendered by the select's own template, so it never reaches the `options` content query.
     * Kept as a separate list rather than folded into `options` because `options` is public API — the
     * filter-bar pipes, `firstFiltered` and the tallies below all mean "the options the consumer
     * projected", and a synthetic entry there would quietly corrupt every one of them.
     * @docs-private
     */
    readonly navigableOptions = new QueryList<KbqOption>();

    /** All of the defined groups of options. */
    readonly optionGroups = contentChildren(KbqOptgroup);

    /** Reference to the optional search component. */
    readonly search = contentChild(KbqSelectSearch);

    /** Reference to the optional empty search result component. */
    readonly searchEmpty = contentChild(KbqSelectSearchEmptyResult);

    /**
     * Template string for hidden items text. Supports {{ number }} placeholder.
     *
     * Follows the active locale while unset; a value assigned here takes precedence over every locale.
     */
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

    /** Label of the "select all" row. Follows the active locale. */
    protected get selectAllText(): string {
        return this.localeConfiguration().selectAll;
    }

    /** Determines whether preselected values are displayed. */
    readonly showPreselectedValues = input<boolean>(false);

    /**
     * Specifies the maximum number of trigger values allowed.
     * This constant limits the size of the trigger values array to ensure performance
     * and prevent excessive memory usage.
     * A value of `0` indicates that there is no limit.
     */
    readonly triggerValuesLimit = input<number>(0);

    /** Classes to be passed to the select panel. Supports the same syntax as the `[class]` binding. */
    readonly panelClass = input<
        | string
        | string[]
        | Set<string>
        | {
              [key: string]: any;
          }
    >(undefined!);

    /** Classes to be passed to the overlay backdrop. */
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
    readonly sortComparator = input<(a: KbqOptionBase, b: KbqOptionBase, options: KbqOptionBase[]) => number>(
        undefined!
    );

    /**
     * Whether to use a multiline matcher or not. Default is false.
     * When true, allows multiple lines of text in the selected value display.
     */
    readonly multiline = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Controls when the search functionality is displayed based on the number of available options.
     *
     * Automatically enables search hiding if value provided, even if `defaultOptions.searchMinOptionsThreshold` is provided.
     * @default undefined
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    set searchMinOptionsThreshold(value: 'auto' | number | undefined) {
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
                this.options.changes.pipe(
                    switchMap((list: QueryList<KbqOption>) =>
                        list.length ? merge(...list.map((option) => option.onSelectionChange)) : EMPTY
                    )
                ),
                this.selectionModel.changed.pipe(
                    startWith(null as any),
                    switchMap(() => {
                        const optionsSet = new Set(this.options.toArray());
                        const virtualSelected = this.selectionModel.selected.filter(
                            (option) => !optionsSet.has(option as KbqOption)
                        );

                        return virtualSelected.length
                            ? merge(...virtualSelected.map((option) => option.onSelectionChange))
                            : EMPTY;
                    })
                )
            );
        }

        return this._ngZone.onStable.asObservable().pipe(
            take(1),
            switchMap(() => this.optionSelectionChanges)
        );
    }) as Observable<KbqOptionSelectionChange>;

    /**
     * Event emitted when the select panel has been toggled. Emits true when opened, false when closed.
     * Also serves as the `openedChange` member of the `KbqSiblingPopup` contract — a tooltip sharing
     * this element's host reacts to it, so its emission timing (gated on `panelDoneAnimatingStream`, see
     * `ngOnInit`) matters beyond this output's original consumers.
     */
    @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted before the select panel starts opening. */
    readonly beforeOpened = output<void>();

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
    readonly selectionChange = output<KbqSelectChange>();

    /**
     * Event emitted when all options are selected or deselected via the Ctrl/Cmd + A shortcut.
     * Not emitted when a custom `selectAllHandler` is supplied — the handler owns the behaviour then.
     */
    readonly onSelectAll = output<KbqSelectAllEvent<KbqOption, KbqSelect>>();

    /**
     * Event that emits whenever the raw value of the select changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    readonly valueChange = output<any>();

    /**
     * Distance in pixels from the bottom of the options panel at which `scrolledToBottom` fires.
     * Default `0` — emits only when the panel is fully scrolled to the bottom.
     */
    readonly scrolledToBottomOffset = input<number, unknown>(0, { transform: numberAttribute });

    /** Emits when the options panel is scrolled to (or within `scrolledToBottomOffset` of) the bottom. */
    readonly scrolledToBottom = output<void>();

    /**
     * Whether the overlay should have a backdrop.
     * When true, clicking the backdrop will close the select.
     */
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

    /**
     * Placeholder text to be shown when no value is selected.
     * Displayed in the trigger when the select is closed and no value is selected.
     */
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

    /**
     * Whether the select is required. Affects validation and display of placeholder.
     */
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

    /**
     * Whether multiple options can be selected.
     * Note: This cannot be changed dynamically after initialization.
     */
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

        this._multiple = value;
    }

    private _multiple: boolean = false;

    /**
     * Function to compare the option values with the selected values.
     * The first argument is a value from an option.
     * The second is a value from the selection.
     * Should return true if the values match.
     * Defaults to strict equality comparison.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
     * Factory used to construct a `KbqVirtualOption` for selected values whose
     * `KbqOption` is not currently rendered (e.g. virtual scroll out of viewport,
     * programmatically set initial value, `showPreselectedValues`).
     *
     * Required when option values are objects so the trigger (and tags in
     * multiple mode) can render a human-readable label. Also lets consumers
     * customise per-value `disabled` state or any future `KbqVirtualOption`
     * fields without adding new `@Input`s.
     *
     * Defaults to `new KbqVirtualOption(value, this.disabled)`, which is correct
     * for primitive values where `value` itself is the display label.
     */
    readonly virtualOptionFactory = input<(value: any) => KbqVirtualOption>();

    /** When `true`, a repeated Ctrl/Cmd+A deselects all options. Off by default (Ctrl+A only selects). */
    readonly selectAllToggle = input(false, { transform: booleanAttribute });

    /**
     * Whether to render the "select all" master checkbox above the options. Multiple selection only.
     *
     * The row acts on the options the user can actually toggle — rendered, enabled and selectable. Since
     * search filtering removes options from the DOM, "select all" under an active query selects only the
     * matches. Enabling it also makes Ctrl/Cmd + A a two-way toggle, so the shortcut and the checkbox
     * never disagree (`selectAllToggle` is implied).
     */
    readonly selectAll = input(false, { transform: booleanAttribute });

    /**
     * Function for handling the Ctrl + A (select all) keyboard combination.
     * By default, the internal handler selects all options.
     * @param event The keyboard event that triggered the handler.
     * @param select Reference to this select component.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
     * Width of the panel. If set to `auto`, the panel will match the trigger width, but will never be
     * narrower than `panelMinWidth`. If set to null or an empty string, the panel will grow to match the
     * longest option's text. Any other value is used as an exact width, and `panelMinWidth` is not applied.
     */
    readonly panelWidth = input<KbqPanelWidth>(this.defaultOptions?.panelWidth || null);

    /**
     * Minimum width of the panel in pixels.
     * If minWidth is larger than window width, it will be ignored.
     */
    readonly panelMinWidth = input<KbqPanelMinWidth, unknown>(
        this.defaultOptions?.panelMinWidth === undefined
            ? KBQ_PANEL_DEFAULT_MIN_WIDTH
            : this.defaultOptions.panelMinWidth,
        { transform: numberAttribute }
    );

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
     * `--kbq-select-panel-size-max-height` custom property on the panel, so it also drives the pinned height
     * of a `cdk-virtual-scroll-viewport` — with virtual scroll the value is an exact height, not a cap.
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

    /** Value of the select control. Can be a single value or array of values for multiple selection. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    /**
     * Unique identifier for the select component.
     * Auto-generates an ID if not provided.
     */
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

    /**
     * Sets the tabIndex of the select element.
     * Automatically set to -1 when disabled.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    /**
     * Whether the select is disabled.
     * When disabled, the select cannot be opened and its value cannot be changed.
     */
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

    /** Whether the select is focused. */
    get focused(): boolean {
        return this._focused || this.panelOpen;
    }

    set focused(value: boolean) {
        this._focused = value;
    }

    /** Whether the select panel is currently open. */
    panelOpen = false;

    /** Whether the overlay panel is currently on screen. Part of the `KbqSiblingPopup` contract. */
    get isAttached(): boolean {
        return this.panelOpen;
    }

    /** Whether virtual scrolling is enabled for the options panel. */
    withVirtualScroll: boolean;

    protected get scrollbarMode(): KbqScrollbarMode {
        return this.withVirtualScroll ? 'native' : this.scrollbarOptions.mode;
    }

    private _focused = false;

    /** Whether the search returned no results. */
    get isEmptySearchResult(): boolean {
        const search = this.search();

        return !!search && this.options?.filter((option) => option.selectable()).length === 0 && !!search.value();
    }

    /**
     * Whether the "select all" row is currently rendered.
     *
     * Unsupported whenever a selected value can exist as a synthetic `KbqVirtualOption` instead of a
     * real, projected `KbqOption` (see `selectValue`) — under `withVirtualScroll` or
     * `showPreselectedValues`. `selectAllTargets` can only see `this.options`, the currently-rendered
     * `KbqOption`s, so a checkbox built on top of it would misreport "everything selected" after only
     * touching the values that happen to have a rendered option.
     */
    protected get showSelectAll(): boolean {
        return (
            this.selectAll() &&
            this.multiSelection &&
            !this.isEmptySearchResult &&
            !this.withVirtualScroll &&
            !this.showPreselectedValues()
        );
    }

    /** Whether every option "select all" can act on is selected. */
    get allOptionsSelected(): boolean {
        const targets = this.selectAllTargets;

        // `[].every()` is `true`: with nothing for "select all" to act on, claiming "all selected" would
        // send the toggle down the deselect branch and check the master checkbox over an untouchable list.
        return targets.length > 0 && targets.every((option) => option.selected);
    }

    /** State of the "select all" master checkbox. */
    get selectAllState(): KbqPseudoCheckboxState {
        return getSelectAllState(this.selectAllAdapter);
    }

    /**
     * Options "select all" acts on, and the ones its checkbox state is derived from.
     *
     * `KbqOption.select()` and `deselect()` do not consult `disabled` or `selectable()`, so the
     * filtering has to happen here rather than being left to the options themselves.
     */
    private get selectAllTargets(): KbqOption[] {
        return this.options?.filter((option) => option.selectable() && !option.disabled) ?? [];
    }

    /** Adapter shared by the master checkbox and the Ctrl/Cmd + A handler, so the two cannot drift apart. */
    private get selectAllAdapter(): KbqSelectAllAdapter<KbqOption> {
        return {
            items: this.selectAllTargets,
            isSelectable: () => true,
            isSelected: (option) => option.selected,
            setSelected: (option, selected) => (selected ? option.select() : option.deselect())
        };
    }

    /**
     * Whether the cleaner (clear button) should be shown.
     * @docs-private
     */
    get canShowCleaner(): boolean {
        return !!this.cleaner()?.canShow;
    }

    /** Returns the currently selected option(s). Single value or array for multiple selection. */
    get selected(): KbqOptionBase | KbqOptionBase[] {
        const selected = this.selectionModel.selected;

        return this.multiSelection
            ? selected.map((option) => this.resolveSelectedOption(option))
            : selected[0] && this.resolveSelectedOption(selected[0]);
    }

    /** Returns the display value for the trigger element. */
    get triggerValue(): string {
        if (this.empty) return '';

        return this.resolveSelectedOption(this.selectionModel.selected[0]).viewValue;
    }

    /** Returns all selected options in display order. */
    get triggerValues(): KbqOptionBase[] {
        if (this.empty) {
            return [];
        }

        const selectedOptions = this.selectionModel.selected.map((option) => this.resolveSelectedOption(option));

        if (this.isRtl()) {
            selectedOptions.reverse();
        }

        return this.triggerValuesLimit() > 0 ? selectedOptions.slice(0, this.triggerValuesLimit()) : selectedOptions;
    }

    /** Whether no option is currently selected. */
    get empty(): boolean {
        return !!this.selectionModel?.isEmpty();
    }

    /** Whether there are no options available. */
    get noOptions(): boolean {
        return this.options?.length === 0;
    }

    /** Returns the first selected option that is not disabled. */
    get firstSelected(): KbqOptionBase | null {
        return (
            this.selectionModel.selected
                .map((option) => this.resolveSelectedOption(option))
                .find((option) => !option.disabled) || null
        );
    }

    /** Whether the first selected option is filtered (not visible in the list). */
    get firstFiltered(): boolean {
        return !this.options.find((option: KbqOption) => option === this.firstSelected);
    }

    /** @docs-private */
    get colorForState(): KbqComponentColors {
        const hasLegacyValidateDirective = this.elementRef.nativeElement.classList.contains(
            'kbq-control_has-validate-directive'
        );

        if (this.disabled) return KbqComponentColors.Empty;

        return (hasLegacyValidateDirective && this.ngControl?.invalid) || this.errorState
            ? KbqComponentColors.Error
            : KbqComponentColors.ContrastFade;
    }

    /** Whether multiple choice is enabled. True if multiple or multiline mode is active. */
    get multiSelection(): boolean {
        return this.multiple || this.multiline();
    }

    /** Whether a "select all" batch is running, so the per-option changes propagate only once. */
    private selectAllInProgress = false;

    /** Subscription to the close event of the overlay. */
    private closeSubscription = Subscription.EMPTY;

    /** Subscription to the options panel scroll event used by `scrolledToBottom`. */
    private scrollSubscription = Subscription.EMPTY;

    /** The scroll offset the panel is restored to when it attaches — the list always opens at the top. */
    private scrollTop = 0;

    /** Unique id for this input. Auto-incremented for each instance. */
    private readonly uid = `kbq-select-${nextUniqueId++}`;

    /** Subject that emits when the component visibility changes. */
    private visibleChanges: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /** Origin element for the overlay panel positioning. */
    protected overlayOrigin?: CdkOverlayOrigin | ElementRef;

    private openPanelTimeout: ReturnType<typeof setTimeout>;

    constructor() {
        super();

        // The "select all" row only exists while the panel is attached, so the key manager's list has to
        // be rebuilt whenever the view query resolves or drops it — `options.changes` alone never fires
        // for it.
        effect(() => {
            this.selectAllOption();

            this.syncNavigableOptions();
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

    /** Lifecycle hook called after component initialization. Initializes selection model and subscriptions. */
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

                    const search = this.search();

                    if (search) {
                        search.focus();
                    }

                    this.scrollbarViewport()?.flashScrollIndicators();
                    this.projectedScrollbarViewport()?.flashScrollIndicators();

                    this.openedChange.emit(true);
                } else {
                    this.openedChange.emit(false);
                    this._changeDetectorRef.markForCheck();
                }
            });

        merge(this.optionSelectionChanges, this.visibleChanges)
            // `delay(0)` rather than a `setTimeout` inside the subscriber: `takeUntilDestroyed` cancels a
            // scheduled emission, but not a timer the subscriber has already started, which would then run
            // its measurements against a destroyed view.
            .pipe(distinctUntilChanged(), delay(0), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.calculateHiddenItems();

                if (this.multiline()) {
                    // A multiline trigger grows with every selected option, and this is the one signal
                    // guaranteed to arrive for it. The trigger's height has changed whatever the anchor
                    // decides, so the panel is repositioned either way.
                    this.updatePanelAnchor();
                    this.setOverlayPosition();
                }
            });
    }

    /** Lifecycle hook for change detection. Updates visibility and error state. */
    ngDoCheck() {
        this.visibleChanges.next(this.isVisible());

        if (this.ngControl) {
            this.updateErrorState();
        }
    }

    /** Lifecycle hook after content initialization. Sets up key manager and option subscriptions. */
    ngAfterContentInit() {
        this.withVirtualScroll = !!this.cdkVirtualForOf();
        this.initKeyManager();

        this.selectionModel.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
            event.added.forEach((option) => option.select());
            event.removed.forEach((option) => option.deselect());
        });

        this.options.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.syncNavigableOptions();
            this.resetOptions();
            this.initializeSelection();
        });

        this.search()
            ?.changes.pipe(
                takeUntilDestroyed(this.destroyRef),
                delay(0),
                // Only while the panel is open. `beforeOpened` gives consumers a chance to (re)load
                // options, and with no options the panel itself opens with a delay, so search changes
                // can land while the panel is still closed. Moving the highlight then is read as
                // keyboard navigation of a closed select and silently overwrites the value.
                filter(() => this.panelOpen && this.isActiveItemStale())
            )
            .subscribe(() => this.keyManager.setFirstItemActive());
    }

    /** Lifecycle hook when component is destroyed. Cleans up subscriptions. */
    ngOnDestroy() {
        this.stateChanges.complete();
        this.closeSubscription.unsubscribe();
        this.unsubscribeFromPanelResize();

        clearTimeout(this.openPanelTimeout);
    }

    /** Updates the error state based on the error state matcher. */
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
     * Formats the hidden items text with the number of hidden items.
     * @param hiddenItemsText Template string with {{ number }} placeholder.
     * @param hiddenItems Number of hidden items to display.
     * @returns Formatted string with the number of hidden items.
     */
    @Input()
    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return hiddenItemsText.replace('{{ number }}', hiddenItems.toString());
    }

    /**
     * Selects every option "select all" can act on, or deselects them all when they are already selected.
     *
     * Backs both the master checkbox and Ctrl/Cmd + A while `selectAll` is on. Emits a single
     * `selectionChange` for the whole batch, followed by `onSelectAll`.
     */
    protected toggleSelectAll(): void {
        const targets = this.selectAllTargets;

        if (!targets.length) return;

        // The per-option selection events are what keep `selectionModel` in step, but each of them would
        // otherwise propagate a value of its own. Suppressing that and propagating once at the end turns
        // N events into the single change the user actually performed.
        this.selectAllInProgress = true;

        try {
            toggleSelectAll(this.selectAllAdapter, { allowDeselect: true });
        } finally {
            this.selectAllInProgress = false;
        }

        this.propagateChanges();
        this.stateChanges.next();

        this.onSelectAll.emit(new KbqSelectAllEvent(this, targets, this.allOptionsSelected));
    }

    /**
     * Clears the current selection.
     * @docs-private
     */
    clear(): void {
        this.selectionModel.clear();
        this.keyManager.setActiveItem(-1);

        this.propagateChanges();
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

    /** Resets the search component if present. */
    resetSearch(): void {
        const search = this.search();

        if (!search) {
            return;
        }

        search.reset();
        /*
        todo the incorrect behaviour of keyManager is possible here
        to avoid first item selection (to provide correct options flipping on closed select)
        we should process options update like it is the first options appearance
        */
        search.isSearchChanged = false;
    }

    /** Toggles the overlay panel open or closed. */
    toggle(): void {
        if (this.panelOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Triggers the opening of the panel component.
     * If the component is disabled or the panel is already open, the call is ignored.
     * Otherwise, the (beforeOpened) event is emitted.
     * When no options are available, the panel is opened after a short delay;
     * if options exist, it opens immediately.
     */
    open(): void {
        if (this.disabled || this.panelOpen) return;

        this.beforeOpened.emit();

        if (this.noOptions) {
            clearTimeout(this.openPanelTimeout);

            this.openPanelTimeout = setTimeout(() => this.openPanel(), delayBeforeDisplayingResultWithoutOptions);
        } else {
            this.openPanel();
        }
    }

    /**
     * Internal method to open the panel. Handles overlay positioning and sizing.
     * Sets up the overlay dimensions based on trigger size and configured options.
     */
    openPanel() {
        const trigger = this.trigger();

        if (!trigger || !this.keyManager) return;

        // add check for form-field bounding rectangles, since it adds extra padding around the trigger
        this.triggerRect = (
            this.parentFormField?.getConnectedOverlayOrigin().nativeElement || trigger.nativeElement
        ).getBoundingClientRect();

        // Note: The computed font-size will be a string pixel value (e.g. "16px").
        // `parseInt` ignores the trailing 'px' and converts this to a number.
        this.triggerFontSize = parseInt(this.window.getComputedStyle(trigger.nativeElement)['font-size']);

        // It's important that we read this as late as possible, because doing so earlier will
        // return a different element since it's based on queries in the form field which may
        // not have run yet. Also this needs to be assigned before we measure the overlay width.
        if (this.parentFormField) {
            this.overlayOrigin = this.parentFormField.getConnectedOverlayOrigin();
        }

        this.updateOverlayWidth(this.panelWidth(), this.panelMinWidth(), this.overlayOrigin ?? this.elementRef);

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

                if (this.search()) {
                    this.lockOverlayWidthForSearch(this.panel());
                }
            });
    }

    /** Closes the overlay panel and focuses the host element. */
    close(): void {
        if (!this.panelOpen) return;

        // the order of calls is important
        this.resetSearch();
        this.panelOpen = false;
        this.unsubscribeFromPanelResize();
        // Back to the two default sides, so the next open is not resolved against a first row that has since
        // changed height.
        this.positions = this.withOverlapPosition(this.positions, null) ?? this.positions;
        this.keyManager.withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');

        this._changeDetectorRef.markForCheck();
        this.onTouched();
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
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

    /**
     * Checks if the current direction is RTL (right-to-left).
     * @returns True if RTL mode is active, false otherwise.
     */
    isRtl(): boolean {
        return this._dir ? this._dir.value === 'rtl' : false;
    }

    /**
     * Handles all keyboard events for the select.
     * Delegates to appropriate handler based on panel state.
     * @param event The keyboard event to handle.
     */
    handleKeydown(event: KeyboardEvent): void {
        if (this.disabled) return;

        if (this.panelOpen) {
            this.handleOpenKeydown(event);
        } else {
            this.handleClosedKeydown(event);
        }
    }

    /** Handles focus event on the select element. */
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
        }
    }

    /**
     * Callback that is invoked when the overlay panel has been attached.
     * Sets up position change subscription and closing actions.
     */
    onAttached(): void {
        this.overlayDir.positionChange.pipe(take(1)).subscribe(() => {
            this._changeDetectorRef.detectChanges();
            this.setOverlayPosition();
            this.optionsContainer().nativeElement.scrollTop = this.scrollTop;

            this.updateScrollSize();
            this.subscribeToScrolledToBottom();
            // Deliberately out of this frame — see `reanchorPanel`. A microtask still lands before paint.
            queueMicrotask(() => this.reanchorPanel());
        });

        // The option list drives the panel's height, so a change to it can settle the anchor question
        // differently — and the panel is realigned on every such change regardless.
        this.options.changes.pipe(delay(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.updatePanelAnchor();
            this.setOverlayPosition();
        });

        this.subscribeToPanelResize();
        this.closeSubscription = this.closingActions().subscribe(() => this.close());
    }

    /** Element the overlay is positioned and sized against. */
    protected getOverlayOriginElement(): HTMLElement | undefined {
        return this.parentFormField?.getConnectedOverlayOrigin().nativeElement ?? this.trigger()?.nativeElement;
    }

    protected isPanelOpen(): boolean {
        return this.panelOpen;
    }

    /**
     * A `cdk-virtual-scroll-viewport` pins its height to `--kbq-select-panel-size-max-height` in both
     * directions, so its `scrollHeight` follows the cap rather than the content.
     */
    protected override isListHeightPinnedToCap(): boolean {
        return this.withVirtualScroll;
    }

    /** Returns the theme to be used on the panel based on parent form field color. */
    getPanelTheme(): string {
        return this.parentFormField ? `kbq-${this.parentFormField.color}` : '';
    }

    /** Returns the full set of classes for the panel: base class, theme and custom `panelClass`. */
    protected getPanelClasses(): string {
        const panelClass = this.panelClass();
        const classes = ['kbq-select__panel', this.getPanelTheme()];

        if (typeof panelClass === 'string') {
            classes.push(panelClass);
        } else if (Array.isArray(panelClass) || panelClass instanceof Set) {
            classes.push(...panelClass);
        } else if (panelClass) {
            classes.push(...Object.keys(panelClass).filter((key) => panelClass[key]));
        }

        return classes.filter(Boolean).join(' ');
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

    /**
     * Handles removal of a matched item in the trigger.
     * @param option The option to remove from selection.
     * @param $event The mouse event that triggered the removal.
     */
    onRemoveMatcherItem(option: KbqOptionBase, $event): void {
        $event.stopPropagation();

        option.deselect();
    }

    /**
     * Calculates the number of hidden items in multiple selection mode.
     * Updates the hiddenItems property and triggers change detection.
     */
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

        this.hiddenItems = (this.selected as ArrayLike<KbqOptionBase>).length - visibleItems;
        this._changeDetectorRef.detectChanges();

        if (this.hiddenItems) {
            const itemsCounter = this.trigger()!.nativeElement.querySelector('.kbq-select__match-hidden-text');
            const matcherList = this.trigger()!.nativeElement.querySelector('.kbq-select__match-list');

            if (!itemsCounter || !matcherList) {
                this._changeDetectorRef.markForCheck();

                return;
            }

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

    /**
     * Gets the height of a single option item.
     * @returns The height in pixels of the first option, or 0 if no options exist.
     */
    getItemHeight(): number {
        return this.options.first ? this.options.first.getHeight() : 0;
    }

    /**
     * Handles click events on the select.
     * Closes the panel if click is inside the footer.
     * @param $event The mouse event to handle.
     */
    handleClick($event: MouseEvent) {
        if (this.footer()?.nativeElement.contains($event.target)) {
            this.close();
        }
    }

    /** @docs-private */
    setSelectedOptionsByClick(option: KbqOption) {
        // `KbqOption.handleClick` routes a shift-click straight here, skipping the `disabled`/`selectable`
        // check that `selectViaInteraction` applies to a plain click — so the guard has to live here.
        // It precedes `setActiveItem` deliberately: the range anchor must not come to rest on an option
        // the user cannot toggle, or the next shift-range would take its direction from that option's
        // (unchangeable) selected state. Mirrors `KbqTreeSelection.setSelectedOptionsByClick`.
        if (option.disabled || !option.selectable()) {
            return;
        }

        if (this.multiple || this.multiline()) {
            this.keyManager.setActiveItem(option);
            // The key manager's list, not `options`: with the "select all" row rendered the two are offset
            // by one, and a range read off `options` would land on the wrong options entirely.
            const options = this.navigableOptions.toArray();

            let fromIndex = this.keyManager.previousActiveItemIndex;
            let toIndex = (this.keyManager.previousActiveItemIndex = this.keyManager.activeItemIndex);
            const selectedOptionState = options[fromIndex]?.selected;

            if (toIndex === fromIndex) {
                this.selectionModel.toggle(option);

                return;
            }

            if (fromIndex > toIndex) {
                [fromIndex, toIndex] = [toIndex, fromIndex];
            }

            options
                .slice(fromIndex, toIndex + 1)
                .filter((item) => !item.disabled && item.selectable())
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
        return (
            isUndefined(this.searchMinOptionsThreshold) ||
            !!this.search()?.value() ||
            this.options.length >= this.searchMinOptionsThreshold
        );
    }

    /** Checks if the component is currently visible in the viewport. */
    private isVisible(): boolean {
        if (!this.isBrowser) return false;

        return this.elementRef.nativeElement.offsetTop < this.elementRef.nativeElement.offsetHeight;
    }

    /** Gets the current overlay position index in the container. */
    private currentOverlayPosition(): number {
        const element = this.overlayDir.overlayRef.hostElement;

        return Array.from(this.overlayContainer.getContainerElement().childNodes).findIndex((node) => {
            return node.firstChild?.['id'] === element.firstChild?.['id'];
        });
    }

    /** Gets the position index of modal overlay in the container. */
    private modalOverlayPosition(): number {
        return Array.from(this.overlayContainer.getContainerElement().childNodes).findIndex((childNode) =>
            (childNode as HTMLElement).classList.contains('kbq-modal-overlay')
        );
    }

    /**
     * Creates an observable of actions that should close the select panel.
     * Includes outside pointer events and overlay detachments.
     */
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

    /** Gets the height of the options container element. */
    private getHeightOfOptionsContainer(): number {
        return this.optionsContainer().nativeElement.getClientRects()[0]?.height;
    }

    /** Updates the keyboard manager scroll size based on options container height. */
    private updateScrollSize(): void {
        if (!this.options.first) {
            return;
        }

        this.keyManager.withScrollSize(Math.floor(this.getHeightOfOptionsContainer() / this.options.first.getHeight()));
    }

    /**
     * Subscribes to scroll events of the options panel and emits `scrolledToBottom`
     * when the panel reaches `scrolledToBottomOffset` pixels from the bottom.
     * Re-subscribes on every panel attach; auto-unsubscribes when the panel closes
     * or the component is destroyed.
     */
    private subscribeToScrolledToBottom(): void {
        this.scrollSubscription.unsubscribe();

        const virtualScrollViewport = this.virtualScrollViewport();
        const distance =
            this.withVirtualScroll && virtualScrollViewport
                ? virtualScrollViewport
                      .elementScrolled()
                      .pipe(map(() => this.virtualScrollViewport()!.measureScrollOffset('bottom')))
                : fromEvent(this.optionsContainer().nativeElement, 'scroll').pipe(
                      map(() => {
                          const element = this.optionsContainer().nativeElement;

                          return element.scrollHeight - element.scrollTop - element.clientHeight;
                      })
                  );

        this._ngZone.runOutsideAngular(() => {
            this.scrollSubscription = distance
                .pipe(
                    auditTime(SCROLLED_TO_BOTTOM_THROTTLE_TIME),
                    map((distance) => distance <= this.scrolledToBottomOffset()),
                    distinctUntilChanged(),
                    filter(Boolean),
                    takeUntilDestroyed(this.destroyRef),
                    takeUntil(this.closedStream)
                )
                .subscribe(() => this._ngZone.run(() => this.scrolledToBottom.emit()));
        });
    }

    /** Calculates the total width of all selected items in the matcher. */
    private getTotalItemsWidthInMatcher(): number {
        const triggerClone = this.buildTriggerClone();

        triggerClone.querySelector('.kbq-select__match-hidden-text')?.remove();
        this._renderer.appendChild(this.trigger()!.nativeElement, triggerClone);

        let totalItemsWidth: number = 0;
        const selectedItemsViewValueContainers = triggerClone.querySelectorAll<HTMLElement>('kbq-tag');

        selectedItemsViewValueContainers.forEach((item) => (totalItemsWidth += this.getItemWidth(item)));

        triggerClone.remove();

        return totalItemsWidth;
    }

    /**
     * Calculates the width of a single item including margins.
     *
     * The elements measured here are `kbq-tag`s, which are `border-box` and carry horizontal
     * padding. `getComputedStyle().width` resolves to the used content-box width whatever
     * `box-sizing` says, so it dropped that padding from every tag and the matcher believed more
     * tags fit than actually do. `getBoundingClientRect()` is always the border box — the same fix
     * `kbqGetPanelWidthOrigin()` carries for the dropdown trigger.
     * @param element The DOM element to measure.
     * @returns Total width including margins and gap.
     */
    private getItemWidth(element: HTMLElement): number {
        const computedStyle = this.window.getComputedStyle(element);

        const width: number = element.getBoundingClientRect().width;
        const marginLeft: number = parseFloat(computedStyle.marginLeft) || 0;
        const marginRight: number = parseFloat(computedStyle.marginRight) || 0;

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

    /** Handles keyboard events when the select is open. */
    private handleOpenKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;

        if ((isArrowKey && event.altKey) || keyCode === ESCAPE || keyCode === TAB) {
            // Close the select on ALT + arrow key to match the native <select>
            event.preventDefault();

            // Prevent ESCAPE from bubbling to ancestor (when inside overlay)
            if (keyCode === ESCAPE) {
                event.stopPropagation();
            }

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

            // The row is not selectable, so `selectViaInteraction()` would be a no-op on it. Handling it
            // here covers both focus positions — the row itself and the search field the panel keeps
            // focus in while the row is merely active.
            if (this.keyManager.activeItem === this.selectAllOption()) {
                this.toggleSelectAll();
            } else {
                this.keyManager.activeItem.selectViaInteraction();
            }
        } else if (this.multiSelection && isSelectAll(event)) {
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

            // Ensure the active option's keyboard-focus indicator is shown even when the
            // index didn't change (e.g. ArrowDown on a single-option list) — without this
            // the panel never gains `cdk-keyboard-focused` and the active border is hidden.
            if (isArrowKey && this.keyManager.activeItemIndex === previouslyFocusedIndex) {
                this.keyManager.activeItem?.focus();
            }

            const search = this.search();

            if (search && this.shouldShowSearch()) {
                search.focus();
            }

            if (search && (this.keyManager.isTyping() || [BACKSPACE, DELETE].includes(keyCode))) {
                setTimeout(() => this.highlightCorrectOption());
            }
        }
    }

    /**
     * Initializes the selection based on the current value.
     * Defers execution to avoid change detection errors.
     */
    private initializeSelection(): void {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            this.setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
        });
    }

    /** Whether the key manager has no active item, or its active item is missing from the current options list. */
    private isActiveItemStale(): boolean {
        const activeItem = this.keyManager.activeItem as KbqOption | null;

        return !activeItem || !this.navigableOptions.some((option) => option === activeItem);
    }

    /**
     * Rebuilds the key manager's list — the "select all" row first, then the projected options — and
     * re-applies the panel's initial highlight whenever the row is what just joined that list.
     *
     * Both callers have to be able to do the second part: whichever of the view query and
     * `options.changes` runs first is the one that brings the row in, and the other then sees a list
     * it is already part of.
     */
    private syncNavigableOptions(): void {
        const selectAllOption = this.selectAllOption();
        const options = this.options?.toArray() ?? [];
        // The row is created together with the overlay, so the highlight `openPanel()` applies is
        // computed against a list that does not hold it yet and lands on the option below it instead.
        // Re-apply it the moment the row takes the lead — the call is idempotent for every other case.
        const selectAllOptionAppeared = !!selectAllOption && this.navigableOptions.first !== selectAllOption;

        this.navigableOptions.reset(selectAllOption ? [selectAllOption, ...options] : options);
        this.navigableOptions.notifyOnChanges();

        if (selectAllOptionAppeared && this.panelOpen) {
            this.highlightCorrectOption();
        }
    }

    /**
     * Sets the selected option based on a value.
     * If no option can be found with the designated value, the select trigger is cleared.
     * @param value The value to select. Can be a single value or array for multiple selection.
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
            // While the panel is open and the user is already navigating a still-present
            // active item, keep it as is: `options.changes` re-runs this method on every
            // appended chunk (e.g. paging), and re-activating the selected option would
            // focus it and scroll the list back to it.
            if (correspondingOption && !this.withVirtualScroll && (!this.panelOpen || this.isActiveItemStale())) {
                this.keyManager.setActiveItem(correspondingOption);
            }
        }

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Finds the option that corresponds to the given value.
     * @param value The value to find.
     * @returns The matching option or undefined if not found.
     */
    private getCorrespondOption(value: any): KbqOptionBase | undefined {
        return [
            ...this.options.toArray(),
            ...this.previousSelectionModelSelected.map((option) => this.resolveSelectedOption(option))
            // Treat null as a special reset value.
        ].find(
            (option: KbqOptionBase) => option.value != null && runCompareWith(this.compareWith, option.value, value)
        );
    }

    /**
     * Finds and selects an option based on its value.
     * @returns Option that has the corresponding value, when it is currently rendered.
     */
    private selectValue(value: any): KbqOption | undefined {
        const correspondingOption = this.getCorrespondOption(value);

        if (correspondingOption) {
            this.selectionModel.select(correspondingOption);
            this.captureSelectedOptionCopy(correspondingOption);

            // Only a currently rendered option can be activated in the key manager.
            return this.options.find((option) => option === correspondingOption);
        }

        const virtualOption = this.createVirtualOptionForValue(value);

        if (virtualOption) {
            this.selectionModel.select(virtualOption);
        }

        return undefined;
    }

    /**
     * Builds a detached option for a value whose `KbqOption` is not rendered, or returns `undefined`
     * when the value cannot be resolved and the consumer gave no way to render it.
     */
    private createVirtualOptionForValue(value: any): KbqVirtualOption | undefined {
        // Treat null as a special reset value, the same way `getCorrespondOption` does.
        if (value == null) return undefined;

        if (this.withVirtualScroll) {
            const source = this.cdkVirtualForOf()?.cdkVirtualForOf;
            const correspondingOptionVirtual =
                source instanceof Array ? source.find((item) => this.compareWith(item, value)) : undefined;

            if (correspondingOptionVirtual) {
                return this.createVirtualOption(correspondingOptionVirtual);
            }

            // The value is missing from the currently loaded data (server-side search, a narrowed down
            // source) — it can still be rendered when a `virtualOptionFactory` maps it to a label.
            return this.virtualOptionFactory() ? this.createVirtualOption(value) : undefined;
        }

        // Without virtual scroll the whole list is rendered, so a value that matched nothing is only
        // kept in the selection when the consumer opted into unresolved values.
        return this.showPreselectedValues() ? this.createVirtualOption(value) : undefined;
    }

    /**
     * Single entry point for building a `KbqVirtualOption` from a raw value.
     * Uses the consumer-provided `virtualOptionFactory` when set, otherwise
     * wraps the raw value with the select's current `disabled` state.
     */
    private createVirtualOption(value: any): KbqVirtualOption {
        const virtualOptionFactory = this.virtualOptionFactory();

        return virtualOptionFactory ? virtualOptionFactory(value) : new KbqVirtualOption(value, this.disabled);
    }

    /**
     * Remembers the value and the label of a selected option while its view is still live, so that the
     * selection survives the view being recycled by `cdk-virtual-scroll` for another item.
     */
    private captureSelectedOptionCopy(option: KbqOptionBase): void {
        if (option instanceof KbqVirtualOption) return;

        this.selectedOptionCopies.set(option, new KbqVirtualOption(option.value, option.disabled, option.viewValue));
    }

    /** Copy of `option` when its view has been recycled for another item, otherwise `option` itself. */
    private resolveSelectedOption(option: KbqOptionBase): KbqOptionBase {
        const copy = this.selectedOptionCopies.get(option);

        if (!copy) return option;

        // A value that no longer matches the copy means the view was recycled for another item. A
        // comparator that throws reads as "no match" here too, falling back to the value actually selected.
        return runCompareWith(this.compareWith, option.value, copy.value) ? option : copy;
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private initKeyManager() {
        const typeAheadDebounce = 200;

        this.keyManager = new ActiveDescendantKeyManager<KbqOption>(this.navigableOptions)
            .withTypeAhead(typeAheadDebounce, this.search() ? -1 : 0)
            .withVerticalOrientation()
            .withHorizontalOrientation(this.isRtl() ? 'rtl' : 'ltr');

        this.keyManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this.panelOpen && this.panel()) {
                this.scrollActiveOptionIntoView();

                this.search()?.focus();
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
        (this.options.length ? merge(...this.options.map((option) => option.stateChanges)) : EMPTY)
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
                this.captureSelectedOptionCopy(option);
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

        // `toggleSelectAll` propagates once for the whole batch instead.
        if (!this.selectAllInProgress && wasSelected !== this.selectionModel.isSelected(option)) {
            this.propagateChanges();
        }

        this.stateChanges.next();
    }

    /** Sorts the selected values based on their order in the panel. */
    private sortValues() {
        if (this.multiSelection) {
            const options = this.options.toArray();

            this.selectionModel.sort((a, b) => {
                const sortComparator = this.sortComparator();

                return sortComparator ? sortComparator(a, b, options) : a.value - b.value;
            });
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

    private scrollActiveOptionIntoView(): void {
        this.keyManager.activeItem?.focus();
    }

    /** Comparison function to specify which option is displayed. Defaults to object equality. */
    private _compareWith = (o1: any, o2: any) => o1 === o2;

    /** Function for handling the combination Ctrl + A (select all). By default, the internal handler is used. */
    private _selectAllHandler(event: KeyboardEvent, select: KbqSelect): void {
        const searchInput = isInput(event) ? (event.target as HTMLInputElement) : null;

        if (shouldSelectSearchText(searchInput)) {
            searchInput!.select();
            event.preventDefault();

            return;
        }

        event.preventDefault();

        // With the master checkbox on screen the shortcut has to behave exactly like clicking it,
        // otherwise the same action would leave the checkbox showing something the selection contradicts.
        if (select.selectAll()) {
            select.toggleSelectAll();

            return;
        }

        const options = select.options.toArray();
        const selectableOptions = options.filter((option) => !option.disabled && option.selectable());

        toggleSelectAll<KbqOption>(
            {
                items: options,
                // A non-selectable option is not one the user could ever toggle by hand — sweeping it up
                // here would select the consumer's own "select all" row along with the real options.
                isSelectable: (option) => !option.disabled && option.selectable(),
                isSelected: (option) => option.selected,
                setSelected: (option, selected) => (selected ? option.select() : option.deselect())
            },
            { allowDeselect: select.selectAllToggle() }
        );

        // `selected` per the KbqSelectAllEvent contract: `true` only when every selectable option is
        // now selected, `false` otherwise (deselected or partial). Reading the live option state keeps
        // this correct even on a no-op (Ctrl+A while everything is already selected, selectAllToggle off).
        const selected = selectableOptions.length > 0 && selectableOptions.every((option) => option.selected);

        select.onSelectAll.emit(new KbqSelectAllEvent(select, selectableOptions, selected));
    }

    /**
     * Calculates the total width and count of visible items.
     * @returns Tuple of [totalVisibleItemsWidth, visibleItemsCount].
     */
    private getTotalVisibleItems(): [number, number] {
        const triggerClone = this.buildTriggerClone();

        const hiddenText = triggerClone.querySelector('.kbq-select__match-hidden-text');

        if (hiddenText) {
            this._renderer.setStyle(hiddenText, 'display', 'block');
        }

        this._renderer.appendChild(this.trigger()!.nativeElement, triggerClone);

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

    /**
     * Creates a hidden clone of the trigger element for width calculations.
     * @returns Clone of the trigger element positioned off-screen.
     */
    private buildTriggerClone(): HTMLDivElement {
        const triggerClone = this.trigger()!.nativeElement.cloneNode(true);

        this._renderer.setStyle(triggerClone, 'position', 'absolute');
        this._renderer.setStyle(triggerClone, 'visibility', 'hidden');
        this._renderer.setStyle(triggerClone, 'top', '-100%');
        this._renderer.setStyle(triggerClone, 'left', '0');
        this._renderer.setStyle(triggerClone, 'max-width', '100%');

        return triggerClone;
    }
}
