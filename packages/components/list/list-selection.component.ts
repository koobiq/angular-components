import { FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CDK_DRAG_HANDLE, CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    contentChild,
    contentChildren,
    ContentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    input,
    isDevMode,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    output,
    Provider,
    QueryList,
    signal,
    ViewChild,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    DOWN_ARROW,
    END,
    ENTER,
    FocusKeyManager,
    getKbqSelectNonFunctionValueError,
    hasModifierKey,
    HOME,
    IFocusableOption,
    isCopy,
    isSelectAll,
    isVerticalMovement,
    KBQ_OPTION_ACTION_PARENT,
    KBQ_TITLE_TEXT_REF,
    KBQ_WINDOW,
    KbqActionContainer,
    kbqFocusOptionActionOnTab,
    KbqMultipleInput,
    KbqOptgroup,
    KbqOptionActionComponent,
    KbqPseudoCheckbox,
    KbqTitleTextRef,
    LEFT_ARROW,
    MultipleMode,
    PAGE_DOWN,
    PAGE_UP,
    resolveMultipleMode,
    RIGHT_ARROW,
    runCompareWith,
    SPACE,
    TAB,
    toggleSelectAll,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { fromEvent, merge, Observable, Subject, Subscription } from 'rxjs';
import { auditTime, startWith, switchMap, take } from 'rxjs/operators';

/** How long consecutive `window.resize` ticks are collapsed before the scroll size is recalculated. */
const RESIZE_AUDIT_TIME = 100;

/**
 * Marks the dragged option while the pointer is over no list that would take it. Styling reads it from the
 * body, which is what resolves the cursor once the options are out of hit testing.
 */
const DROP_FORBIDDEN_CLASS = 'kbq-list-option_drop-forbidden';

/**
 * Put on the drag preview whichever shape it takes, so styling has one hook that survives the
 * `dragPreview` mode switch.
 */
const DRAG_PREVIEW_CLASS = 'kbq-list-drag-preview';

export interface KbqOptionEvent<T = any> {
    option: KbqListOption<T>;
}

export const KBQ_SELECTION_LIST_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqListSelection),
    multi: true
};

export class KbqListSelectionChange<T = any> {
    constructor(
        public source: KbqListSelection<T>,
        public option: KbqListOption<T>
    ) {}
}

export class KbqListSelectAllEvent<T> {
    constructor(
        public source: KbqListSelection,
        public options: T[]
    ) {}
}

/**
 * Event class that occurs when copying an item from the KbqListSelection.
 * Used to pass data about the copied item and copy context.
 *
 * @param source - instance of KbqListSelection
 * @param option - instance of KbqListOption
 * @param event - original keyboard event (optional) that triggered the copy
 */
export class KbqListCopyEvent<T> {
    constructor(
        public source: KbqListSelection,
        public option: T,
        public event?: KeyboardEvent
    ) {}
}

/**
 * Data attached to the underlying `CdkDrag` while a list option is being dragged. Kept unexported:
 * `dropped` already hands the option over, so nothing outside this file has to read `CdkDrag.data`.
 */
type KbqListOptionDragData = { option: KbqListOption };

/**
 * How the floating copy of an option is rendered while it is dragged.
 *
 * `text` shows a compact plate with the option's own text and nothing else, `full` a clone of the
 * whole row.
 */
export type KbqListDragPreview = 'text' | 'full';

/**
 * Whether a draggable option advertises with the cursor that the whole row can be picked up.
 *
 * `auto` leaves the row the cursor it would have anyway, `grab` turns the row into a visible handle.
 * A projected `cdkDragHandle` takes the grab over either way.
 */
export type KbqListDragCursor = 'auto' | 'grab';

/** Event emitted when an option changes its position by dragging. */
export type KbqListSelectionDroppedEvent = Pick<CdkDragDrop<KbqListSelection>, 'previousIndex' | 'currentIndex'> & {
    /** Option that has been moved. */
    option: KbqListOption;
    /** List the option has been moved into. */
    container: KbqListSelection;
    /** List the option has been taken from. Equal to `container` when reordering within a single list. */
    previousContainer: KbqListSelection;
    /** Pointer event that ended the drag. */
    event: MouseEvent | TouchEvent;
};

@Component({
    selector: 'kbq-list-selection',
    template: `
        <ng-content />
        @if (dropIndicatorOffset() !== null) {
            <!-- Purely decorative: the drop target is a pointer affordance, not a status message. -->
            <div
                class="kbq-list-selection__drop-indicator"
                aria-hidden="true"
                [style.--kbq-list-drop-indicator-offset.px]="dropIndicatorOffset()"
            ></div>
        }
    `,
    styleUrls: ['./list.scss', 'list-tokens.scss'],
    providers: [KBQ_SELECTION_LIST_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-selection',
        role: 'listbox',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-list-selection_horizontal]': 'horizontal()',
        '[class.kbq-list-selection_draggable]': 'draggable',
        '[attr.aria-multiselectable]': 'multiple',
        '[attr.aria-orientation]': 'horizontal() ? "horizontal" : null',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'focus()',
        '(blur)': 'blur()'
    },
    // `id` is exposed so that a consumer-set id survives `CdkDropList`'s own `[attr.id]` host binding
    // and can be used as a `connectedTo` reference.
    hostDirectives: [{ directive: CdkDropList, inputs: ['id'] }],
    exportAs: 'kbqListSelection',
    preserveWhitespaces: false
})
export class KbqListSelection<T = any> implements AfterContentInit, AfterViewInit, OnDestroy, ControlValueAccessor {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetectorRef = inject(ChangeDetectorRef);
    private clipboard = inject(Clipboard, { optional: true });
    protected readonly focusMonitor = inject(FocusMonitor);

    keyManager: FocusKeyManager<KbqListOption<T>>;

    @ContentChildren(forwardRef(() => KbqListOption), { descendants: true }) options: QueryList<KbqListOption<T>>;

    readonly onSelectAll = output<KbqListSelectAllEvent<KbqListOption<T>>>();

    /**
     * Kept as a decorator `@Output()`/`EventEmitter` on purpose: `copyActiveOption` branches on
     * `onCopy.observed` to decide between the consumer handler and the built-in clipboard copy.
     * `output()` exposes no subscriber introspection, so migrating it would silently run both
     * paths for every existing `(onCopy)` consumer. Mirrors `KbqTreeSelection.onCopy`.
     */
    @Output() readonly onCopy = new EventEmitter<KbqListCopyEvent<KbqListOption<T>>>();

    /**
     * Whether clicking an option clears the rest of the selection. Defaults to `true`, and to `false` for
     * `multiple="checkbox"`, where a click is expected to toggle a single row.
     *
     * Stays an accessor input: {@link multiple} derives its default, which a signal `input()` cannot do
     * (inputs are read-only from inside the component). Assigning it — from a template binding or
     * imperatively — pins the value, so a later mode change leaves it alone.
     */
    @Input()
    get autoSelect(): boolean {
        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this.autoSelectPinned = true;
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

    private autoSelectPinned = false;

    /**
     * Whether the last selected option can be deselected.
     * Stays an accessor input for the same reason as {@link autoSelect}.
     */
    @Input()
    get noUnselectLast(): boolean {
        return this._noUnselectLast;
    }

    set noUnselectLast(value: boolean) {
        this.noUnselectLastPinned = true;
        this._noUnselectLast = coerceBooleanProperty(value);
    }

    private _noUnselectLast: boolean = true;

    private noUnselectLastPinned = false;

    /**
     * Whether options can be reordered by dragging them.
     * Reordering never mutates the data — handle the `dropped` event and move the item yourself.
     */
    @Input({ transform: booleanAttribute })
    get draggable(): boolean {
        return this._draggable && !this.disabled;
    }

    set draggable(value: boolean) {
        this._draggable = value;
        this.syncDraggableState();
    }

    private _draggable: boolean = false;

    /**
     * Lists that options of this list can be moved into. Accepts `KbqListSelection` instances or the
     * `id` of another list. `cdkDropListGroup` on a common ancestor connects lists automatically.
     */
    readonly connectedTo = input<KbqListSelection<T> | string | readonly (KbqListSelection<T> | string)[]>([]);

    /**
     * What the option's floating copy looks like while it is dragged. Defaults to `text`: a compact
     * plate carrying the option's label and caption, capped at a readable width. Use `full` to drag a
     * clone of the whole row, checkbox, icons and action button included.
     */
    readonly dragPreview = input<KbqListDragPreview>('text');

    /**
     * Whether a draggable option shows the grab cursor over the whole row. Defaults to `auto`, which
     * leaves the row the cursor it has anyway. Use `grab` where the whole row is meant to read as a
     * handle. An option carrying a projected `cdkDragHandle` ignores this — the handle keeps the grab.
     */
    readonly dragCursor = input<KbqListDragCursor>('auto');

    /** Emits when an option changes its position by dragging. */
    readonly dropped = output<KbqListSelectionDroppedEvent>();

    /** When `true`, a repeated Ctrl/Cmd+A deselects all options. Off by default (Ctrl+A only selects). */
    readonly selectAllToggle = input(false, { transform: booleanAttribute });

    /**
     * Selection mode of the list.
     *
     * `checkbox` renders a checkbox in every option, `keyboard` selects without one. A bare `multiple` and
     * `true` both mean `checkbox`; `single`, `false` and an absent attribute mean single selection. The mode
     * can be changed at any time — narrowing it to single selection keeps the first selected option and
     * reports the shortened value through the `ControlValueAccessor`.
     *
     * The getter reports whether more than one option can be selected; read {@link multipleMode} for the
     * mode itself.
     */
    @Input()
    get multiple(): boolean {
        return !!this.mode();
    }

    set multiple(value: KbqMultipleInput) {
        this.setMultipleMode(resolveMultipleMode(value));
    }

    /** Resolved selection mode, or `null` when only one option can be selected. */
    get multipleMode(): MultipleMode | null {
        return this.mode();
    }

    set multipleMode(value: MultipleMode | null) {
        this.setMultipleMode(value);
    }

    /**
     * Backing signal of {@link multipleMode}. A signal rather than a field because the mode is also written
     * from inside the component: options read it through `multiple` and `showCheckbox`, and only a signal
     * read re-runs their `OnPush` views and host bindings.
     */
    private readonly mode = signal<MultipleMode | null>(null);

    readonly horizontal = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Tab index of the list.
     * Stays an accessor input: the getter is derived from {@link disabled} and the setter also
     * records the user-provided value, which the roving focus logic restores after `tabOut`.
     */
    @Input()
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    /**
     * Whether the list is disabled.
     * Stays an accessor input: `setDisabledState` writes it from the `ControlValueAccessor`, which a
     * signal `input()` cannot do.
     */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
            this.syncDraggableState();
        }
    }

    private _disabled: boolean = false;

    /**
     * Function used for comparing an option against the selected value when determining which
     * options should appear as selected. The first argument is the value of an options. The second
     * one is a value from the selected value. A boolean must be returned.
     *
     * Bind a stable reference — a field or a bound method. An expression that builds a new function on
     * every change detection pass makes the list re-resolve every value against every option each pass.
     */
    readonly compareWith = input<(o1: T, o2: T) => boolean, (o1: T, o2: T) => boolean>((a1, a2) => a1 === a2, {
        // Mirrors `KbqSelect`, which throws from its setter: a comparator that is not callable would
        // otherwise surface as an empty selection and a warning per option.
        transform: (fn) => {
            if (typeof fn !== 'function') {
                throw getKbqSelectNonFunctionValueError();
            }

            return fn;
        }
    });

    userTabIndex: number | null = null;

    get showCheckbox(): boolean {
        return this.mode() === MultipleMode.CHECKBOX;
    }

    // Emits a change event whenever the selected state of an option changes.
    readonly selectionChange = output<KbqListSelectionChange<T>>();

    selectionModel: SelectionModel<KbqListOption<T>>;

    get optionFocusChanges(): Observable<KbqOptionEvent<T>> {
        return merge(...this.options.map((option) => option.onFocus));
    }

    get optionBlurChanges(): Observable<KbqOptionEvent<T>> {
        return merge(...this.options.map((option) => option.onBlur));
    }

    _value: T[] | null;

    private readonly destroyRef = inject(DestroyRef);
    private readonly platform = inject(Platform);
    private readonly ngZone = inject(NgZone);
    private readonly window = inject(KBQ_WINDOW);
    private readonly dropList = inject<CdkDropList<KbqListSelection>>(CdkDropList, { host: true });

    /**
     * Distance from the list's content box to the gap the dragged option would land in, or `null`
     * while no drag is hovering this list. Drives the insertion indicator.
     */
    protected readonly dropIndicatorOffset = signal<number | null>(null);

    /** Gap the indicator currently marks, used as `currentIndex` when the drag is dropped here. */
    private dropIndex: number | null = null;

    private pendingMoveSubscription: Subscription | null;

    private hasWarnedOnDragContainer = false;

    /** Whether a deferred {@link initializeSelection} pass is already queued for this microtask turn. */
    private pendingSelectionInit = false;

    /** Whether a form control has ever written to the list, i.e. whether {@link _value} speaks for a model. */
    private hasWrittenValue = false;

    /** Subscription to {@link selectionModel}, re-pointed whenever the model is replaced. */
    private selectionModelSubscription: Subscription | null = null;

    constructor() {
        // Single selection until the `multiple` input says otherwise. A model has to exist this early
        // because `KbqListOption.setSelected` refuses to touch the selection without one, and a static
        // `multiple` attribute reaches the input right after the constructor, before any option exists.
        this.selectionModel = new SelectionModel<KbqListOption<T>>(false);

        // A different comparator means a different set of options can match the model value. `compareWith`
        // is a signal input, so there is no setter to re-run matching from the way `KbqSelect` does.
        effect(() => {
            this.compareWith();
            this.initializeSelection();
        });

        this.setupDropListInitialProperties();
    }

    /**
     * Applies a new selection mode: re-derives the {@link autoSelect} / {@link noUnselectLast} defaults the
     * consumer has not pinned, and rebuilds the `SelectionModel` when the multiplicity itself changes —
     * CDK freezes that flag at construction, so the model has to be replaced rather than reconfigured.
     */
    private setMultipleMode(next: MultipleMode | null): void {
        if (next === this.mode()) {
            return;
        }

        this.mode.set(next);

        const checkbox = next === MultipleMode.CHECKBOX;

        // Written past the setters on purpose: going through them would pin the value and make the next
        // mode change leave the defaults it just wrote in place.
        if (!this.autoSelectPinned) {
            this._autoSelect = !checkbox;
        }

        if (!this.noUnselectLastPinned) {
            this._noUnselectLast = !checkbox;
        }

        if (this.selectionModel.isMultipleSelection() !== !!next) {
            this.rebuildSelectionModel(!!next);
        }

        this.changeDetectorRef.markForCheck();
    }

    /** Replaces the `SelectionModel` with one of the given multiplicity, keeping what the new one can hold. */
    private rebuildSelectionModel(multiple: boolean): void {
        const selected = (this.options?.toArray() ?? []).filter((option) => option.selected);
        // Narrowing keeps the first selected option in DOM order; widening keeps everything.
        const kept = multiple ? selected : selected.slice(0, 1);
        const dropped = selected.slice(kept.length);

        // `initiallySelectedValues` seeds the model without emitting, which is what the kept options need:
        // their own `selected` mirrors are already up to date.
        this.selectionModel = new SelectionModel<KbqListOption<T>>(multiple, kept);
        this.bindSelectionModel();

        // Applied after the swap so the mirrors follow the model that is actually in use now.
        dropped.forEach((option) => option.setSelected(false));

        if (dropped.length) {
            // Deferred for the same reason as `initializeSelection`: a bound `[multiple]` is written during
            // change detection, and reporting the shortened value straight back to the form control there
            // would raise "Expression has changed after it was checked".
            Promise.resolve().then(() => this.reportValueChange());
        }
    }

    /** (Re)points the change subscription at the current {@link selectionModel}. */
    private bindSelectionModel(): void {
        this.selectionModelSubscription?.unsubscribe();

        this.selectionModelSubscription = this.selectionModel.changed
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
                for (const item of event.added) {
                    item.selected = true;
                }

                for (const item of event.removed) {
                    item.selected = false;
                }
            });
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<KbqListOption<T>>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(!this.horizontal())
            .withHorizontalOrientation(this.horizontal() ? 'ltr' : null);

        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this._tabIndex = -1;

            setTimeout(() => {
                this._tabIndex = this.userTabIndex || 0;
                this.changeDetectorRef.markForCheck();
            });
        });

        // The initial value is applied by the `options.changes` subscription below, which starts with the
        // options already present. Applying it synchronously here instead would settle the selection after
        // the parent view was checked and raise NG0100.
        // Repairs each option's `_selected` mirror after the model changes on its own — single-selection
        // mode drops the previous winner whenever another option is selected. Deliberately not moved
        // earlier: writes that happen during input binding would flip a host binding mid-pass (NG0100).
        // `setSelected` consults the model too, so a write that lands before this is still recoverable.
        this.bindSelectionModel();

        this.listenToOptionsFocus();

        this.options.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.updateTabIndex();
            this.initializeSelection();
        });

        if (!this.platform.isBrowser) return;

        this.warnOnUnsupportedDragContainer();
        this.updateScrollSize();

        // `updateScrollSize` only feeds the key manager's page size — nothing rendered depends on it,
        // so the listener stays outside the zone and never schedules change detection. `auditTime`
        // collapses a resize drag into one pair of forced layout reads per interval.
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.window, 'resize')
                .pipe(auditTime(RESIZE_AUDIT_TIME), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.updateScrollSize());
        });
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    focus(): void {
        if (this.options.length === 0) {
            return;
        }

        if (this.selectionModel.selected.length) {
            this.options.find((option) => option.selected)?.focus();
        } else {
            this.keyManager.setFirstItemActive();
        }
    }

    /** Clears the active key-manager item (unless an option is still focused) and marks the list as touched. */
    blur(): void {
        if (!this.hasFocusedOption()) {
            this.keyManager.setActiveItem(-1);
        }

        this.onTouched();
        this.changeDetectorRef.markForCheck();
    }

    /** Selects every non-disabled option and reports the new value to the `ControlValueAccessor`. */
    selectAll(): void {
        this.options.forEach((option) => option.setSelected(true));

        this.reportValueChange();
    }

    /** Deselects every option and reports the new value to the `ControlValueAccessor`. */
    deselectAll(): void {
        this.options.forEach((option) => option.setSelected(false));

        this.reportValueChange();
    }

    updateScrollSize(): void {
        if (this.horizontal() || !this.options.first) {
            return;
        }

        const optionHeight = this.options.first.getHeight();

        // `getHeight()` is 0 whenever the option is not laid out (SSR, jsdom, `display: none`);
        // dividing by it would hand the key manager a `NaN` page size.
        if (!optionHeight) {
            return;
        }

        this.keyManager.withScrollSize(Math.floor(this.getHeight() / optionHeight));
    }

    setSelectedOptionsByClick(option: KbqListOption<T>, shiftKey: boolean, ctrlKey: boolean): void {
        if (shiftKey && this.multiple) {
            this.selectActiveOptions();
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) {
                return;
            }

            this.selectionModel.toggle(option);
        } else if (this.autoSelect) {
            this.selectionModel.clear();
            this.selectionModel.toggle(option);
        } else {
            this.selectionModel.toggle(option);
        }

        this.emitChangeEvent(option);
        this.reportValueChange();
    }

    setSelectedOptionsByKey(option: KbqListOption<T>, shiftKey: boolean, ctrlKey: boolean): void {
        if (shiftKey && this.multiple) {
            this.selectActiveOptions();
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) {
                return;
            }
        } else if (this.autoSelect) {
            this.options.forEach((item) => item.setSelected(false));
            option.setSelected(true);
        }

        if (shiftKey || ctrlKey || this.autoSelect) {
            this.emitChangeEvent(option);
            this.reportValueChange();
        }
    }

    selectActiveOptions(): void {
        const options = this.options.toArray();
        let fromIndex = this.keyManager.previousActiveItemIndex;
        let toIndex = (this.keyManager.previousActiveItemIndex = this.keyManager.activeItemIndex);

        // `previousActiveItemIndex` stays -1 until the key manager has moved at least once, so a
        // shift + click before any keyboard navigation has no anchor to extend the range from.
        if (toIndex === fromIndex || !this.isValidIndex(fromIndex) || !this.isValidIndex(toIndex)) {
            return;
        }

        const selectedOptionState = options[fromIndex].selected;

        if (fromIndex > toIndex) {
            [fromIndex, toIndex] = [toIndex, fromIndex];
        }

        options
            .slice(fromIndex, toIndex + 1)
            .filter((item) => !item.disabled)
            .forEach((renderedOption) => {
                if (!selectedOptionState && this.noUnselectLast && this.selectionModel.selected.length === 1) {
                    return;
                }

                renderedOption.setSelected(selectedOptionState);
            });
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(values: T[] | T | null): void {
        this.hasWrittenValue = true;

        // A form control may push a bare value instead of an array; normalize it here so that
        // `_value` always matches its declared type and stays safe to iterate over.
        this._value = values == null ? null : Array.isArray(values) ? values : [values];

        if (this.options) {
            this.setOptionsFromValues(this._value ?? []);
        }
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: T[]) => void): void {
        this.onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Implemented as a part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        // `KbqListOption.disabled` reads the list through its getter, so disabling the list cascades
        // to every option without overwriting their own `disabled` inputs.
        this.disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
    }

    /** Values of the currently selected options. */
    getSelectedOptionValues(): T[] {
        return this.options.filter((option) => option.selected).map((option) => option.value);
    }

    // Toggles the selected state of the currently focused option.
    toggleFocusedOption(): void {
        const focusedIndex = this.keyManager.activeItemIndex;

        if (focusedIndex != null && this.isValidIndex(focusedIndex)) {
            const focusedOption: KbqListOption<T> = this.options.toArray()[focusedIndex];

            if (focusedOption && !focusedOption.disabled && this.canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this.emitChangeEvent(focusedOption);
                this.reportValueChange();
            }
        }
    }

    /** Whether `listOption` is allowed to be deselected, given {@link noUnselectLast}. */
    canDeselectLast(listOption: KbqListOption<T>): boolean {
        return !(this.noUnselectLast && this.selectionModel.selected.length === 1 && listOption.selected);
    }

    /**
     * Rendered height of the element, or 0 when it is not laid out (SSR, jsdom, `display: none`).
     * @docs-private
     */
    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()?.[0]?.height ?? 0;
    }

    // View to model callback that should be called if the list or its options lost focus.
    onTouched: () => void = () => {};

    // Removes an option from the selection list and updates the active item.
    removeOptionFromList(option: KbqListOption<T>): void {
        if (!option.hasFocus) {
            return;
        }

        const optionIndex = this.getOptionIndex(option);

        // Check whether the option is the last item
        if (optionIndex === this.options.length - 1) {
            this.keyManager.setPreviousItemActive();
        } else {
            this.keyManager.setNextItemActive();
        }
    }

    /** Handles keydown events on the list. */
    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if ([SPACE, ENTER, LEFT_ARROW, RIGHT_ARROW].includes(keyCode) || isVerticalMovement(event)) {
            event.preventDefault();
        }

        if (this.multiple && isSelectAll(event)) {
            this.selectAllHandler(event, this);

            return;
        } else if (isCopy(event)) {
            this.copyActiveOption(event);

            return;
        } else if ([SPACE, ENTER].includes(keyCode)) {
            this.toggleFocusedOption();

            return;
        } else if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (this.horizontal() ? keyCode === RIGHT_ARROW : keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (this.horizontal() ? keyCode === LEFT_ARROW : keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else if (keyCode === HOME) {
            this.keyManager.setFirstItemActive();
        } else if (keyCode === END) {
            this.keyManager.setLastItemActive();
        } else if (keyCode === PAGE_UP) {
            this.keyManager.setPreviousPageItemActive();
        } else if (keyCode === PAGE_DOWN) {
            this.keyManager.setNextPageItemActive();
        } else {
            // Everything the list does not navigate on itself goes to the key manager, which is what
            // drives type-ahead. Arrow keys never reach it — the branches above own them — so the
            // manager's own orientation config cannot double-handle them.
            this.keyManager.onKeydown(event);
        }

        if (this.keyManager.activeItem && this.isNavigationKey(event)) {
            this.setSelectedOptionsByKey(
                this.keyManager.activeItem,
                hasModifierKey(event, 'shiftKey'),
                // ctrlKey is for Windows, metaKey is for MacOS
                hasModifierKey(event, 'ctrlKey', 'metaKey')
            );
        }
    }

    /** Whether the key just handled moved the active option, taking the list orientation into account. */
    private isNavigationKey(event: KeyboardEvent): boolean {
        if (this.horizontal() && [LEFT_ARROW, RIGHT_ARROW].includes(event.keyCode)) {
            return true;
        }

        return isVerticalMovement(event);
    }

    // Reports a value change to the ControlValueAccessor
    reportValueChange(): void {
        if (this.options) {
            const value = this.getSelectedOptionValues();

            this.onChange(value);
            this._value = value;
        }
    }

    // Emits a change event if the selected state of an option changed.
    emitChangeEvent(option: KbqListOption<T>): void {
        this.selectionChange.emit(new KbqListSelectionChange<T>(this, option));
    }

    private initializeSelection(): void {
        // Several triggers land in the same turn — `options.changes`, the comparator effect, a form write.
        // They would all apply the identical value, so the first one queued does the work for all of them.
        if (this.pendingSelectionInit) {
            return;
        }

        this.pendingSelectionInit = true;

        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve().then(() => {
            this.pendingSelectionInit = false;

            // `options` is a content query: the comparator effect can reach this before it has settled.
            // Once a form control has written, an empty value applies as an empty selection instead of
            // being skipped, so that swapping the comparator also clears what the previous one matched.
            // Without a control the list has no model to speak for, and `[selected]` options stand.
            if (this.options && (this._value || this.hasWrittenValue)) {
                this.setOptionsFromValues(this._value ?? []);
            }
        });
    }

    protected updateTabIndex(): void {
        // Check to see if we need to update our tab index
        this._tabIndex = this.userTabIndex || (this.options.length === 0 ? -1 : 0);
    }

    private onCopyDefaultHandler(): void {
        this.clipboard?.copy(String(this.keyManager.activeItem!.value));
    }

    /**
     * Re-points the focus/blur streams at the current options every time the query list changes.
     * `switchMap` tears down the previous `merge` for us, so no manual subscription bookkeeping.
     */
    private listenToOptionsFocus(): void {
        this.options.changes
            .pipe(
                startWith(null),
                switchMap(() => this.optionFocusChanges),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                const index: number = this.options.toArray().indexOf(event.option);

                if (this.isValidIndex(index)) {
                    this.keyManager.updateActiveItem(index);
                }
            });

        this.options.changes
            .pipe(
                startWith(null),
                switchMap(() => this.optionBlurChanges),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.blur());
    }

    /** Checks whether any of the options is focused. */
    private hasFocusedOption(): boolean {
        return this.options.some((option) => option.hasFocus);
    }

    // Returns the option with the specified value.
    private getOptionByValue(value: T): KbqListOption<T> | undefined {
        const compareWith = this.compareWith();

        // `null`/`undefined` are left to the comparator rather than rejected here: an option declared
        // without a `[value]` reports `undefined` back through the form control, and has to be able to
        // find itself again when that value is re-applied.
        return this.options.find((option) => runCompareWith(compareWith, option.value, value));
    }

    // Sets the selected options based on the specified values.
    private setOptionsFromValues(values: T[]): void {
        // Resolved up front and applied as a delta: `setSelected` early-returns on an unchanged state, so
        // re-applying the same value writes nothing to the `SelectionModel` and schedules no change
        // detection. Deselecting everything first would churn both on every call.
        const selection = new Set(values.map((value) => this.getOptionByValue(value)));

        this.options.forEach((option) => option.setSelected(selection.has(option)));
    }

    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    // Returns the index of the specified list option.
    private getOptionIndex(option: KbqListOption<T>): number {
        return this.options.toArray().indexOf(option);
    }

    private setupDropListInitialProperties(): void {
        // Lets the `dropped` handler map a `CdkDropList` back to the list that owns it.
        this.dropList.data = this;
        // The drop position is shown by an insertion indicator instead of by opening a gap, so CDK must
        // not sort: the options stay put and the dragged one keeps its slot as a faded placeholder.
        // Both flags are re-read from the directive on every drag start, so assigning once is enough.
        this.dropList.sortingDisabled = true;
        // Without an anchor the placeholder follows the option into the connected list, leaving the
        // origin list with a hole instead of the faded row.
        this.dropList.hasAnchor = true;
        this.syncDraggableState();

        effect(() => {
            this.dropList.orientation = this.horizontal() ? 'horizontal' : 'vertical';
            // `CdkDropList` resolves its siblings on every drag start, so a late assignment is picked up.
            this.dropList.connectedTo = this.resolveConnectedDropLists();
        });

        // `enter()` is not gated on `sortingDisabled`, so the placeholder follows the option into
        // whichever list it is dragged over and pushes that list's options apart. Only the list the
        // drag started in may show it — there it is the faded row left behind. Toggled imperatively
        // because the placeholder is already in the DOM by the time this runs, and waiting for change
        // detection would let the shifted layout paint for a frame.
        this.dropList.entered.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ item }) => {
            item.getPlaceholderElement().classList.toggle(
                'kbq-list-option_foreign-placeholder',
                item.dropContainer.data !== this
            );
        });

        this.dropList.dropped
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ previousIndex, previousContainer, container, item, event }) => {
                const { option }: KbqListOptionDragData = item.data;
                const target: KbqListSelection = container.data;
                // Sorting is disabled, so CDK reports the untouched starting index. The gap the indicator
                // marked is the real target; without one the pointer was either outside every list we know
                // or over the place the option already occupies, and both resolve to a move that changes
                // nothing.
                const currentIndex = target.dropIndex ?? previousIndex;

                this.clearDropIndicators(option);

                this.dropped.emit({
                    option,
                    previousIndex,
                    currentIndex,
                    previousContainer: previousContainer.data,
                    container: target,
                    event
                });

                this.followMovedOption(option, target);
            });
    }

    /**
     * `CdkDropList` numbers only the options it has rendered, so inside a virtual scroll the indices
     * `dropped` reports do not address the consumer's backing array and the move silently lands on the
     * wrong item. Warn instead of letting it pass unnoticed.
     */
    private warnOnUnsupportedDragContainer(): void {
        // Runs on every `draggable`/`disabled` change as well as on init, so it has to tolerate being
        // called before the content children exist and to stay quiet once it has had its say.
        if (this.hasWarnedOnDragContainer || !isDevMode() || !this.draggable || !this.platform.isBrowser) {
            return;
        }

        const insideVirtualScroll = !!this.elementRef.nativeElement.querySelector('cdk-virtual-scroll-viewport');

        if (insideVirtualScroll) {
            // eslint-disable-next-line no-console
            console.warn(
                'KbqListSelection: `draggable` is not supported inside `cdk-virtual-scroll-viewport`. The ' +
                    'indices reported by `dropped` count only the rendered options.'
            );
        }

        this.hasWarnedOnDragContainer = insideVirtualScroll;
    }

    /** Keeps the underlying CDK directives in sync with the resolved `draggable` state. */
    private syncDraggableState(): void {
        this.dropList.disabled = !this.draggable;
        this.options?.forEach((option) => option.syncDraggableState());
        this.warnOnUnsupportedDragContainer();
        this.changeDetectorRef.markForCheck();
    }

    private normalizeConnectedTo(): readonly (KbqListSelection | string)[] {
        const connectedTo = this.connectedTo();

        return Array.isArray(connectedTo) ? connectedTo : [connectedTo as KbqListSelection | string];
    }

    private resolveConnectedLists(): KbqListSelection[] {
        return this.normalizeConnectedTo().filter((item): item is KbqListSelection => typeof item !== 'string');
    }

    private resolveConnectedDropLists(): (CdkDropList<KbqListSelection> | string)[] {
        return this.normalizeConnectedTo().map((item) => (typeof item === 'string' ? item : item.dropList));
    }

    /**
     * Tracks the dragged option and paints the insertion indicator in whichever list the pointer is
     * over. Lists connected by `id` alone cannot be resolved to an instance, so they never light up.
     *
     * @docs-private
     */
    onOptionDragMoved(option: KbqListOption, pointer: { x: number; y: number }): void {
        const lists: KbqListSelection[] = [this, ...this.resolveConnectedLists()];
        const hovered = lists.find((list) => list.containsPoint(pointer));

        for (const list of lists) {
            if (list !== hovered) {
                list.clearDropIndicator();
            }
        }

        hovered?.showDropIndicator(option, pointer);

        // Toggled on the element rather than through a signal: `moved` arrives outside the Angular zone,
        // and the cursor may not lag a frame behind the pointer.
        option.getHostElement().classList.toggle(DROP_FORBIDDEN_CLASS, !hovered);
    }

    /**
     * Drops the indicator in every list that could be showing one for this drag.
     *
     * @docs-private
     */
    clearDropIndicators(option: KbqListOption): void {
        const lists: KbqListSelection[] = [this, ...this.resolveConnectedLists(), option.listSelection];

        for (const list of lists) {
            list.clearDropIndicator();
        }

        option.getHostElement().classList.remove(DROP_FORBIDDEN_CLASS);
    }

    private clearDropIndicator(): void {
        this.dropIndex = null;
        this.dropIndicatorOffset.set(null);
    }

    private containsPoint({ x, y }: { x: number; y: number }): boolean {
        if (!this.draggable) {
            return false;
        }

        const { top, right, bottom, left } = this.elementRef.nativeElement.getBoundingClientRect();

        return x >= left && x <= right && y >= top && y <= bottom;
    }

    /**
     * Resolves the gap the pointer sits in and positions the indicator on it. Geometry is read on every
     * move rather than cached at drag start: nothing in the list reflows while dragging, but CDK
     * auto-scrolls near the edges, which would silently invalidate a cache.
     */
    private showDropIndicator(dragged: KbqListOption, pointer: { x: number; y: number }): void {
        const horizontal = this.horizontal();
        // The dragged option is left out on purpose: CDK pulls its host element out of the flow, and
        // excluding it makes the resulting gap index directly usable as `currentIndex` — that is exactly
        // the index space `moveItemInArray` and `transferArrayItem` expect.
        const rects = this.options
            .filter((option) => option !== dragged)
            .map((option) => option.getHostElement().getBoundingClientRect());

        const startOf = (rect: DOMRect) => (horizontal ? rect.left : rect.top);
        const endOf = (rect: DOMRect) => (horizontal ? rect.right : rect.bottom);
        const midpointOf = (rect: DOMRect) => (startOf(rect) + endOf(rect)) / 2;

        const position = horizontal ? pointer.x : pointer.y;
        const index = rects.filter((rect) => position >= midpointOf(rect)).length;

        // The dragged option is not among `rects`, so the gaps above and below it collapse into the one
        // carrying its own index — the place it already occupies. Marking it would promise a move that
        // changes nothing, so the indicator stays hidden and the drop falls back to `previousIndex`.
        if (index === this.getOptionIndex(dragged)) {
            this.clearDropIndicator();

            return;
        }

        const container = this.elementRef.nativeElement.getBoundingClientRect();
        const scrolled = horizontal
            ? this.elementRef.nativeElement.scrollLeft
            : this.elementRef.nativeElement.scrollTop;

        // The gap sits before the first option, or right after the one that precedes it. An empty list
        // has no options to measure, so the indicator goes to the top of its content box.
        let boundary = startOf(container);

        if (rects.length) {
            boundary = index === 0 ? startOf(rects[0]) : endOf(rects[index - 1]);
        }

        this.dropIndex = index;
        this.dropIndicatorOffset.set(boundary - startOf(container) + scrolled);
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Points the key manager at the option's new place, but only once the consumer has actually applied
     * the move — the list never reorders its own content, so nothing happens if `dropped` is left
     * unhandled. `setActiveItem` also re-anchors `previousActiveItemIndex`, which `options.changes`
     * leaves behind on the slot the option came from and shift-range selection would extend from.
     */
    private followMovedOption(option: KbqListOption, container: KbqListSelection): void {
        const { value } = option;

        // Tracked on the list the move is awaited on, so that a move into a connected list does not
        // cancel one still pending here. A move that is never applied leaves its subscription pending,
        // so drop the previous one first.
        container.pendingMoveSubscription?.unsubscribe();

        container.pendingMoveSubscription = container.options.changes
            .pipe(take(1), takeUntilDestroyed(container.destroyRef))
            .subscribe(() => {
                const options = container.options.toArray();
                // Reordering within a list keeps the instance; moving between lists recreates it.
                const index = options.includes(option)
                    ? options.indexOf(option)
                    : options.findIndex((item) => runCompareWith(container.compareWith(), item.value, value));

                if (index !== -1) {
                    container.keyManager.setActiveItem(index);
                }
            });
    }

    // View to model callback that should be called whenever the selected options change.
    private onChange: (value: T[]) => void = () => {};

    /**
     * Function for handling the combination Ctrl + A (select all). By default, the internal handler is used,
     * which toggles the selection of all non-disabled options.
     */
    @Input()
    get selectAllHandler(): (event: KeyboardEvent, list: KbqListSelection<T>) => void {
        return this._selectAllHandler;
    }

    set selectAllHandler(fn: (event: KeyboardEvent, list: KbqListSelection<T>) => void) {
        if (typeof fn !== 'function') {
            throw Error('`selectAllHandler` must be a function.');
        }

        this._selectAllHandler = fn;
    }

    private _selectAllHandler(event: KeyboardEvent, list: KbqListSelection<T>): void {
        event.preventDefault();

        const options = list.options.toArray();

        toggleSelectAll<KbqListOption<T>>(
            {
                items: options,
                isSelectable: (option) => !option.disabled,
                isSelected: (option) => option.selected,
                setSelected: (option, selected) => option.setSelected(selected)
            },
            { allowDeselect: list.selectAllToggle() }
        );

        list.reportValueChange();

        list.onSelectAll.emit(
            new KbqListSelectAllEvent(
                list,
                options.filter((option) => !option.disabled)
            )
        );
    }

    private copyActiveOption(event: KeyboardEvent): void {
        if (!this.keyManager.activeItem) return;

        const option = this.keyManager.activeItem;

        option.preventBlur = true;

        if (this.onCopy.observed) {
            this.onCopy.emit(new KbqListCopyEvent(this, option, event));
        } else {
            this.onCopyDefaultHandler();

            event.preventDefault();
        }

        option.preventBlur = false;
    }
}

/**
 * Marker directive for the secondary line of a `kbq-list-option`.
 *
 * Purely a styling hook: it adds the `kbq-list-option-caption` class the list theme keys its
 * muted caption typography and per-state colors off.
 */
@Directive({
    selector: '[kbq-list-option-caption]',
    host: {
        class: 'kbq-list-option-caption'
    }
})
export class KbqListOptionCaption {}

/**
 * Component for list-options of selection-list. Each list-option can automatically
 * generate a checkbox and can put current item into the selectionModel of selection-list
 * if the current item is selected.
 */
@Component({
    selector: 'kbq-list-option',
    imports: [
        CdkDragPreview,
        KbqPseudoCheckbox,
        KbqActionContainer
    ],
    templateUrl: './list-option.html',
    providers: [
        { provide: KBQ_OPTION_ACTION_PARENT, useExisting: KbqListOption },
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqListOption }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-option',
        role: 'option',
        '[class.kbq-selected]': 'selected',
        '[class.kbq-list-option_multiple]': 'listSelection.multiple',
        '[class.kbq-list-option_draggable]': 'draggable',
        '[class.kbq-list-option_grab-cursor]': 'showsGrabCursor',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-focused]': 'hasFocus',
        '[class.kbq-action-button-focused]': 'actionButton()?.active',
        '[attr.aria-selected]': 'selected',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '(focusin)': 'focus()',
        '(blur)': 'blur()',
        '(click)': 'handleClick($event)',
        '(keydown)': 'onKeydown($event)'
    },
    hostDirectives: [CdkDrag],
    exportAs: 'kbqListOption',
    preserveWhitespaces: false
})
export class KbqListOption<T = any> implements OnDestroy, OnInit, IFocusableOption, KbqTitleTextRef {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetector = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);
    private readonly drag = inject<CdkDrag<KbqListOptionDragData>>(CdkDrag, { host: true });
    private readonly destroyRef = inject(DestroyRef);
    listSelection: KbqListSelection<T> = inject(KbqListSelection);
    readonly group = inject(KbqOptgroup, { optional: true });
    hasFocus: boolean = false;
    preventBlur: boolean = false;

    readonly onFocus = new Subject<KbqOptionEvent<T>>();

    readonly onBlur = new Subject<KbqOptionEvent<T>>();

    readonly actionButton = contentChild(KbqOptionActionComponent);

    // `KbqOptionActionComponent` reads these as directive instances through KBQ_OPTION_ACTION_PARENT,
    // so they must stay decorator queries. A signal `contentChild` would expose the query function
    // instead of the trigger, making `dropdownTrigger.dropdownClosed` undefined and throwing on `.pipe`
    // when an action button is rendered — see #DS-5079.
    @ContentChild(KbqTooltipTrigger) tooltipTrigger?: KbqTooltipTrigger;
    @ContentChild(KbqDropdownTrigger) dropdownTrigger?: KbqDropdownTrigger;
    readonly pseudoCheckbox = contentChild(KbqPseudoCheckbox);

    /**
     * Drag handles the consumer has projected into the option. Nothing else reads them — `CdkDrag`
     * collects its own through DI — they only tell the option whether the whole row starts a drag.
     */
    private readonly dragHandles = contentChildren(CDK_DRAG_HANDLE, { descendants: true });

    readonly text = viewChild.required<ElementRef>('text');

    /**
     * Not a duplicate of {@link text}: this is the `KbqTitleTextRef` property that `title.directive.ts`
     * reads through `KBQ_TITLE_TEXT_REF`. The interface is a plain `ElementRef`, so it cannot become a
     * signal query without breaking that contract — same class of constraint as #DS-5079.
     */
    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    // Whether the label should appear before or after the checkbox. Defaults to 'after'
    readonly checkboxPosition = input<'before' | 'after'>(undefined!);

    /**
     * This is set to true after the first OnChanges cycle so we don't clear the value of `selected`
     * in the first cycle.
     */
    private inputsInitialized = false;

    /**
     * Value of the option, reported through the list's `ControlValueAccessor`.
     * Stays an accessor input: the setter drops the selection when the value is replaced.
     */
    @Input()
    get value(): T {
        return this._value;
    }
    set value(newValue: T) {
        // An equal-but-new object — an immutable refetch, a `@for` tracked by id — must not drop the
        // selection, so the incoming value is put to the model rather than to the value it replaces.
        // That keeps the comparator in its documented `(optionValue, modelValue)` order, which an
        // asymmetric comparator (options carry objects, the model carries ids) depends on.
        //
        // The reference check ahead of it is not just a fast path: it is what keeps an unchanged value
        // from being dropped when the comparator throws, since a swallowed throw also reads as "no match".
        const modelValues = this.listSelection._value;

        if (
            this.inputsInitialized &&
            this.selected &&
            newValue !== this._value &&
            modelValues != null &&
            !modelValues.some((modelValue) => runCompareWith(this.listSelection.compareWith(), newValue, modelValue))
        ) {
            this.selected = false;
        }

        this._value = newValue;
    }
    private _value: T;

    /**
     * Whether the option is disabled.
     * Stays an accessor input: the getter also reports the disabled state inherited from the list
     * and the option group, which a signal `input()` cannot express.
     */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        const listSelectionDisabled = this.listSelection && this.listSelection.disabled;
        const groupDisabled = this.group && this.group.disabled;

        return listSelectionDisabled || groupDisabled || this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.syncDraggableState();
        }
    }

    private _disabled = false;

    /**
     * Whether the option can be reordered by dragging. Set it to `false` to pin a single option while
     * the rest of the list stays draggable. Unrelated to `disabled`: the option keeps taking focus and
     * selection.
     *
     * Stays an accessor input: the getter reports the resolved state, which the option can only narrow —
     * the list gates its whole drop list, so an option cannot opt back in on its own.
     */
    @Input({ transform: booleanAttribute })
    get draggable(): boolean {
        return this._draggable && this.listSelection.draggable && !this.disabled;
    }

    set draggable(value: boolean) {
        this._draggable = value;
        this.syncDraggableState();
    }

    private _draggable = true;

    /**
     * Whether the option renders a pseudo-checkbox.
     * Stays an accessor input: when unset the getter falls back to the list's own mode.
     */
    @Input()
    get showCheckbox(): boolean {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.listSelection.showCheckbox;
    }

    set showCheckbox(value: BooleanInput) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean | undefined;

    /**
     * Whether the option is selected.
     * Stays an accessor input: the state lives in the list's `SelectionModel`, not on the option.
     */
    @Input({ transform: booleanAttribute })
    get selected(): boolean {
        return this.listSelection.selectionModel?.isSelected(this) || false;
    }

    set selected(value: boolean) {
        if (value !== this._selected) {
            this.setSelected(value);
        }
    }

    private _selected = false;

    get tabIndex(): number | null {
        return this.disabled ? null : -1;
    }

    protected get externalPseudoCheckbox(): boolean {
        return !!this.pseudoCheckbox();
    }

    /**
     * Whether the row itself advertises the grab. Gated on `draggable` so that a pinned option inside a
     * `dragCursor="grab"` list does not promise a pick-up it would refuse. The handle case is left to
     * CSS, which already hands the grab over to a projected `cdkDragHandle`.
     */
    protected get showsGrabCursor(): boolean {
        return this.draggable && this.listSelection.dragCursor() === 'grab';
    }

    constructor() {
        this.syncDraggableState();

        // The only class that lands on the preview in both modes: the text one is a plate of our own,
        // the full one a clone of the option. Styling keys "a drag is in progress" off it.
        this.drag.previewClass = DRAG_PREVIEW_CLASS;

        // Without a projected handle the whole row starts the drag, so a touch has to lose to a scroll
        // gesture first. A handle is unambiguous and may start immediately. `CdkDrag` re-reads the delay
        // on every `beforeStarted`, so assigning it whenever the query settles is enough.
        effect(() => {
            this.drag.dragStartDelay = this.dragHandles().length ? 0 : { touch: 300, mouse: 0 };
        });

        // Assigned lazily: referencing `this` while the host directive is still being constructed
        // would capture a half-initialized option.
        // Nothing is cleared on `ended`: it fires *before* `dropped`, so tearing the indicator down
        // there would take the resolved target index with it and turn every drop into a no-op.
        this.drag.started.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.drag.data = { option: this };
            this.listSelection.clearDropIndicators(this);
        });

        // Sorting is disabled, so CDK gives no running feedback about where the option would land —
        // the owning list derives it from the pointer and paints the insertion indicator itself.
        this.drag.moved.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ pointerPosition }) => {
            this.listSelection.onOptionDragMoved(this, pointerPosition);
        });
    }

    /**
     * Keeps the underlying `CdkDrag` in sync with the resolved `draggable` state.
     *
     * @docs-private
     */
    syncDraggableState(): void {
        this.drag.disabled = !this.draggable;
        this.changeDetector.markForCheck();
    }

    ngOnInit(): void {
        // Resolving the model value is the list's job, not the option's. An option that matched itself
        // here answered a different question than `getOptionByValue` does — every match self-selected,
        // while the list picks the first — so a comparator that matches more than one option produced a
        // different selection depending on which path ran. The list re-resolves on `options.changes`.
        const wasSelected = this._selected;

        // List options that are selected at initialization can't be reported properly to the form
        // control. This is because it takes some time until the selection-list knows about all
        // available options. Also it can happen that the ControlValueAccessor has an initial value
        // that should be used instead. Deferring the value change report to the next tick ensures
        // that the form control value is not being overwritten.
        Promise.resolve().then(() => {
            if (this._selected || wasSelected) {
                this.selected = true;
                this.changeDetector.markForCheck();
            }
        });

        this.inputsInitialized = true;
    }

    ngOnDestroy(): void {
        if (this.selected) {
            // We have to delay this until the next tick in order
            // to avoid changed after checked errors.
            Promise.resolve().then(() => (this.selected = false));
        }

        this.listSelection.removeOptionFromList(this);
    }

    /** Toggles the selected state of this option. */
    toggle(): void {
        this.selected = !this.selected;
    }

    getLabel(): string {
        const text = this.text();

        return text ? (text.nativeElement.textContent ?? '') : '';
    }

    /**
     * Splits the option's text into the two lines the `text` drag preview shows. The caption is
     * projected into the same container as the label, so the label is whatever that container holds
     * apart from the caption — subtracting one string from the other would be guesswork.
     *
     * Taken off a clone rather than by walking the container's children, the way `KbqDropdownItem`
     * drops icons out of its own label: `textContent` on an element skips the comment nodes Angular
     * leaves behind for its anchors, while reading one of those nodes directly would hand back the
     * anchor's name.
     *
     * Trimmed because `htmlWhitespaceSensitivity: 'ignore'` lets the indentation of the consumer's
     * template into the projected text.
     *
     * @docs-private
     */
    getDragPreviewText(): { label: string; caption: string } {
        const clone = (this.text().nativeElement as HTMLElement).cloneNode(true) as HTMLElement;
        const caption = clone.querySelector('.kbq-list-option-caption');

        caption?.remove();

        return { label: (clone.textContent ?? '').trim(), caption: (caption?.textContent ?? '').trim() };
    }

    /** Sets the selected state directly on the list's `SelectionModel`, bypassing the `selected` input setter. */
    setSelected(selected: boolean): void {
        const { selectionModel } = this.listSelection;

        if (!selectionModel) {
            return;
        }

        // The model is consulted alongside the mirror so that an option the model dropped behind the
        // mirror's back — single-selection mode does that whenever another option is selected — can still
        // be re-applied instead of being early-returned away.
        if (this._selected === selected && selectionModel.isSelected(this) === selected) {
            return;
        }

        this._selected = selected;

        if (selected) {
            this.listSelection.selectionModel.select(this);
        } else {
            this.listSelection.selectionModel.deselect(this);
        }

        this.changeDetector.markForCheck();
    }

    /**
     * Rendered height of the element, or 0 when it is not laid out (SSR, jsdom, `display: none`).
     * @docs-private
     */
    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()?.[0]?.height ?? 0;
    }

    /** Handles click events on the list option. */
    protected handleClick($event: MouseEvent): void {
        if (this.disabled) {
            return;
        }

        this.listSelection.setSelectedOptionsByClick(
            this,
            hasModifierKey($event, 'shiftKey'),
            // ctrlKey is for Windows, metaKey is for MacOS
            hasModifierKey($event, 'ctrlKey', 'metaKey')
        );
    }

    /** Handles keydown events on the list option. */
    protected onKeydown($event: KeyboardEvent): void {
        kbqFocusOptionActionOnTab($event, this.actionButton());
    }

    /** Moves DOM focus to this option, unless it is disabled or already focused. */
    focus(): void {
        if (this.disabled || this.hasFocus || this.actionButton()?.hasFocus) {
            return;
        }

        this.elementRef.nativeElement.focus();

        this.onFocus.next({ option: this });

        Promise.resolve().then(() => {
            this.hasFocus = true;

            this.changeDetector.markForCheck();
        });
    }

    /** Marks this option as blurred once the zone stabilizes, unless {@link preventBlur} is set. */
    blur(): void {
        if (this.preventBlur) {
            return;
        }

        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the list
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.ngZone.run(() => {
                    this.hasFocus = false;

                    if (this.actionButton()?.hasFocus) {
                        return;
                    }

                    this.onBlur.next({ option: this });
                });
            });
    }

    /** The option's host DOM element. */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}
