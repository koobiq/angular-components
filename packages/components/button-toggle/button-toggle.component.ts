import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    Input,
    input,
    isDevMode,
    OnDestroy,
    OnInit,
    output,
    Provider,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import {
    DOWN_ARROW,
    END,
    getNodesWithoutComments,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTitleDirective } from '@koobiq/components/title';

/** Acceptable types for a button toggle. */
export type ToggleType = 'checkbox' | 'radio';

/**
 * Provider Expression that allows kbq-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqButtonToggleGroup),
    multi: true
};

/**
 * Child nodes that take part in the icon detection: comments and whitespace-only text nodes are
 * ignored so that detection does not depend on `preserveWhitespaces`.
 */
const getContentNodes = (element: Node): Node[] =>
    getNodesWithoutComments(element.childNodes).filter(
        (node) => node.nodeType !== Node.TEXT_NODE || !!node.textContent?.trim()
    );

/**
 * Whether two group values describe the same selection. An unset value and an empty selection are
 * the same thing, which is what keeps a multiple-selection group from announcing `[]` over a
 * `[(value)]` binding that still holds `undefined`.
 */
const sameValue = (a: unknown, b: unknown): boolean => {
    if (a === b) {
        return true;
    }

    const toArray = (value: unknown) => (Array.isArray(value) ? value : value == null ? [] : null);
    const arrayA = toArray(a);
    const arrayB = toArray(b);

    return !!arrayA && !!arrayB && arrayA.length === arrayB.length && arrayA.every((item, i) => item === arrayB[i]);
};

/** Change event object emitted by KbqButtonToggle. */
export class KbqButtonToggleChange {
    constructor(
        /** The KbqButtonToggle that emits the event. */
        public source: KbqButtonToggle,
        /** The value assigned to the KbqButtonToggle. */
        public value: any
    ) {}
}

/**
 * Selection group for `KbqButtonToggle`.
 *
 * By default it behaves like a radio-button group — one toggle at a time, announced as a
 * `radiogroup` and walked with the arrow keys. With `multiple` the toggles become independent
 * toggle buttons and the group is announced as a plain `group`.
 *
 * Name it with a plain `aria-label`/`aria-labelledby` attribute. The host is the very element the
 * consumer writes, so an input aliased to the same name would only write back what is already
 * there — and would wipe an `[attr.aria-label]` binding, which never reaches the input.
 */
@Directive({
    selector: 'kbq-button-toggle-group',
    providers: [KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR],
    host: {
        class: 'kbq-button-toggle-group',
        '[class.kbq-button-toggle_vertical]': 'vertical()',
        '[class.kbq-button-toggle-group_stretched]': 'stretched()',
        '[attr.role]': 'role()',
        '[attr.aria-orientation]': 'ariaOrientation()'
    },
    exportAs: 'kbqButtonToggleGroup'
})
export class KbqButtonToggleGroup implements ControlValueAccessor, OnInit, OnDestroy {
    private _changeDetector = inject(ChangeDetectorRef);

    /** Whether the toggle group is vertical. */
    readonly vertical = input(false, { transform: booleanAttribute });

    /** Whether the toggle group stretches to fill its container width, with toggles sharing equal space. */
    readonly stretched = input(false, { transform: booleanAttribute });

    /** Whether multiple button toggles can be selected. */
    readonly multiple = input(false, { transform: booleanAttribute });

    /**
     * Value of the toggle group: an array in multiple-selection mode, a single value otherwise.
     *
     * An accessor rather than a `model()`: writing it walks the toggles to find the ones that match,
     * and reading it reports the selection. `[(value)]` works all the same.
     *
     * An assigned value that corresponds to no toggle is kept and reported as is, so that it applies
     * to a toggle rendered later — the same contract as `KbqRadioGroup`. It follows that `value` can
     * name a toggle `selected` does not hold: `selected` only ever reports toggles that exist.
     */
    @Input()
    get value(): any {
        return this.currentValue();
    }

    set value(newValue: any) {
        this.setSelectionByValue(newValue);

        // A write the group answers with the value it was given has nothing to announce: the binding
        // slot already holds it, and echoing the group's own normalisation of it back over that slot
        // — `[]` for an unset multiple-selection group — is the `NG0100` this guards.
        if (sameValue(newValue, this.value)) {
            this.reportedValue = this.value;

            return;
        }

        this.emitValueChange();
    }

    /**
     * Selected button toggles in the group: an array in multiple-selection mode, one toggle otherwise.
     * Only toggles that exist, so a `value` waiting for its toggle is not represented here.
     */
    get selected(): KbqButtonToggle | KbqButtonToggle[] | null {
        return this.currentSelection();
    }

    /** Child button toggle buttons. */
    readonly buttonToggles = contentChildren<KbqButtonToggle>(forwardRef(() => KbqButtonToggle));

    /** Whether the whole button toggle group is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled();
    }

    set disabled(value: boolean) {
        this._disabled.set(value);
    }

    /**
     * Event that emits whenever the value of the group changes.
     * Used to facilitate two-way data binding.
     * @docs-private
     */
    readonly valueChange = output<any>();

    /** Event emitted when the group's value changes. */
    readonly change = output<KbqButtonToggleChange>();

    private readonly _disabled = signal(false);
    private selectionModel: SelectionModel<KbqButtonToggle>;

    /**
     * Selection of `selectionModel`, mirrored into a signal. It is what makes a toggle's `checked`
     * state reactive: a toggle derives its own state from here instead of being told, one by one,
     * to check itself again.
     */
    private readonly selectedToggles = signal<readonly KbqButtonToggle[]>([]);

    /** Value the selection alone describes, with nothing said about an assignment waiting for its toggle. */
    private readonly selectedValue = computed(() => {
        const selected = this.selectedToggles();

        return this.multiple() ? selected.map((toggle) => toggle.value) : selected[0]?.value;
    });

    /**
     * Computed once per selection change, so a repeated read hands back the same array reference.
     *
     * The selection is authoritative for the toggles it holds; whatever the assignment names beyond
     * them is appended, because those toggles may still be rendered. Reporting the empty selection
     * instead would push `undefined` back through a `[(value)]` binding and leave `NG0100` behind.
     */
    private readonly currentValue = computed(() => {
        const selected = this.selectedValue();
        const assigned = this.rawValue();

        if (this.multiple()) {
            const values = selected as unknown[];
            const pending = (Array.isArray(assigned) ? assigned : []).filter((value) => !values.includes(value));

            // A fresh array every time: the assigned one belongs to the consumer, and handing it
            // back would let them mutate what feeds their own `[value]` binding.
            return [...values, ...pending];
        }

        return selected !== undefined ? selected : assigned;
    });

    private readonly currentSelection = computed<KbqButtonToggle | KbqButtonToggle[] | null>(() => {
        const selected = this.selectedToggles();

        return this.multiple() ? [...selected] : selected[0] || null;
    });

    /** ARIA role of the group: a radio group in single-selection mode, a plain grouping otherwise. */
    protected readonly role = computed(() => (this.multiple() ? 'group' : 'radiogroup'));

    /**
     * Layout of the group, announced alongside its role so that the arrow-key affordance a screen
     * reader describes matches the direction the toggles actually run in.
     *
     * A radio group is the only mode that has one: `role="group"` does not support `aria-orientation`
     * (AXE `aria-allowed-attr`), and with `multiple` there are no arrow keys to describe anyway.
     */
    protected readonly ariaOrientation = computed(() => {
        if (this.multiple()) return null;

        return this.vertical() ? 'vertical' : 'horizontal';
    });

    /**
     * Whether the group has been destroyed. A selected toggle schedules its own removal from the
     * selection on a microtask, which outlives a teardown of the whole group.
     */
    private destroyed = false;

    /**
     * Value the consumer assigned, kept for as long as it is not represented by the selection: the
     * toggle it names may be created later — behind an `@if`, or simply after the assignment, which
     * always lands before `ngOnInit` and so before there is a selection model to apply it to.
     *
     * An interaction replaces it, so a value the user has moved off cannot resurface on a toggle
     * rendered afterwards.
     */
    private readonly rawValue = signal<unknown>(undefined);

    /** Value last reported through `valueChange`, so that an echo of it stays silent. */
    private reportedValue: unknown;

    /**
     * The method to be called in order to update ngModel.
     * Now `ngModel` binding is not supported in multiple selection mode.
     */
    controlValueAccessorChangeFn: (value: any) => void = () => {};

    /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
    onTouched: () => void = () => {};

    ngOnInit() {
        this.selectionModel = new SelectionModel<KbqButtonToggle>(this.multiple(), undefined, false);
    }

    ngOnDestroy() {
        this.destroyed = true;
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value Value to be set to the model.
     */
    writeValue(value: any) {
        this.value = value;
        this._changeDetector.markForCheck();
    }

    /**
     * Registers the callback that reports a value change to the form model.
     * Implemented as part of ControlValueAccessor.
     */
    registerOnChange(fn: (value: any) => void) {
        this.controlValueAccessorChangeFn = fn;
    }

    /**
     * Registers the callback that marks the form control as touched.
     * Implemented as part of ControlValueAccessor.
     */
    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    /**
     * Disables the group from the form model.
     * Implemented as part of ControlValueAccessor.
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * Dispatches a change event for the group value.
     *
     * @param source Toggle the change originated from. Taken from the interaction rather than from the
     * selection, which is empty whenever the last selected toggle of a multiple-selection group is
     * unchecked — there is no "last selected" toggle left to report then.
     */
    emitChangeEvent(source: KbqButtonToggle): void {
        const event = new KbqButtonToggleChange(source, this.value);

        this.controlValueAccessorChangeFn(event.value);
        this.change.emit(event);
    }

    /**
     * Syncs a button toggle's selected state with the model value.
     * @param toggle Toggle to be synced.
     * @param select Whether the toggle should be selected.
     * @param isUserInput Whether the change was a result of a user interaction.
     */
    syncButtonToggle(toggle: KbqButtonToggle, select: boolean, isUserInput = false) {
        // A destroyed toggle drops itself from the selection on a microtask, which still runs when
        // the whole group is torn down: there is nothing left to sync and nobody left to notify.
        if (this.destroyed) {
            return;
        }

        // The previously selected toggle of a single-selection group is dropped by the selection
        // model itself, and re-renders from the selection: unchecking it by hand would re-enter here
        // and announce the empty selection it leaves behind for the length of one call.
        if (select) {
            this.selectionModel.select(toggle);
        } else {
            this.selectionModel.deselect(toggle);
        }

        this.publishSelection();

        if (isUserInput) {
            // The interaction is the new assignment: anything the consumer assigned before it has
            // been answered, and keeping it would let it come back on a toggle rendered later.
            this.rawValue.set(this.selectedValue());
        } else if (!select) {
            this.dropPendingValue(toggle.value);
        }

        // Only emit the change event for user input.
        if (isUserInput) {
            this.emitChangeEvent(toggle);
        }

        // Note: this one is not limited to user interactions, because it is what Angular syncs the
        // two-way data binding up with — an interaction is only one of the things that move a value.
        this.emitValueChange();
    }

    /** Checks whether a button toggle is selected. */
    isSelected(toggle: KbqButtonToggle): boolean {
        return this.selectedToggles().includes(toggle);
    }

    /** Determines whether a button toggle should be checked on init, from the value waiting for it. */
    isPrechecked(toggle: KbqButtonToggle) {
        const rawValue = this.rawValue();

        if (rawValue === undefined || toggle.value == null) {
            return false;
        }

        return this.multiple() && Array.isArray(rawValue) ? rawValue.includes(toggle.value) : toggle.value === rawValue;
    }

    /** Mirrors the selection model into the signal the toggles derive their state from. */
    private publishSelection(): void {
        this.selectedToggles.set([...this.selectionModel.selected]);
    }

    /**
     * Forgets a value that a toggle has just stopped representing. A value only waits for a toggle
     * until one takes it: a toggle leaving the selection — destroyed, or unchecked from code —
     * answers it, and keeping it would make it resurface on the next toggle rendered with it.
     */
    private dropPendingValue(value: unknown): void {
        const assigned = this.rawValue();

        if (!this.multiple()) {
            if (assigned === value) {
                this.rawValue.set(undefined);
            }
        } else if (Array.isArray(assigned) && assigned.includes(value)) {
            this.rawValue.set(assigned.filter((item) => item !== value));
        }
    }

    /** Announces the current value, unless it is the one already reported. */
    private emitValueChange(): void {
        const value = this.value;

        if (sameValue(this.reportedValue, value)) {
            return;
        }

        this.reportedValue = value;
        this.valueChange.emit(value);
    }

    /**
     * Updates the selection state of the toggles in the group based on a value. Resolved in one pass:
     * walking the toggles one by one would publish an intermediate empty selection and announce it.
     */
    private setSelectionByValue(value: any | any[]) {
        if (this.multiple() && value && !Array.isArray(value)) {
            throw Error('Value must be an array in multiple-selection mode.');
        }

        this.rawValue.set(value);

        if (!this.selectionModel) {
            return;
        }

        const values: unknown[] = this.multiple() ? (value ?? []) : [value];
        const matched = this.buttonToggles().filter((toggle) => toggle.value != null && values.includes(toggle.value));

        this.selectionModel.clear();
        this.selectionModel.select(...(this.multiple() ? matched : matched.slice(0, 1)));
        this.publishSelection();
    }
}

/** Single button inside of a toggle group. */
@Component({
    selector: 'kbq-button-toggle',
    imports: [
        CdkObserveContent,
        KbqTitleDirective,
        KbqButtonModule
    ],
    // Both title references sit on the label box on purpose. The box that paints `text-overflow` is
    // the only one whose `scrollWidth` still reports the untruncated label, so it has to be the one
    // `kbq-title` measures; and measuring it against the whole button instead would leave a dead zone
    // as wide as an icon plus its gap, where the label is already clipped but the tooltip does not
    // open yet. Measured against itself, the comparison is exactly `clientWidth < scrollWidth`.
    //
    // The ARIA lives on the inner button rather than on the host, because that is the element the
    // user actually focuses. `KbqButton` leaves a role it did not choose itself alone, which is what
    // makes `role="radio"` survive on a host it also decorates.
    template: `
        <button
            kbq-button
            kbq-title
            type="button"
            [kbqStyle]="'transparent'"
            [class.kbq-selected]="checked"
            [disabled]="disabled"
            [tabIndex]="tabIndexValue()"
            [attr.role]="role()"
            [attr.aria-checked]="ariaChecked()"
            [attr.aria-pressed]="ariaPressed()"
            [attr.aria-label]="ariaLabel()"
            [attr.aria-labelledby]="ariaLabelledby()"
            (click)="onToggleClick()"
        >
            <div class="kbq-button-toggle-wrapper" (cdkObserveContent)="updateIconType()">
                <ng-content select="[kbqButtonPrefix]" />
                <span #kbqTitleContainer #kbqTitleText class="kbq-button-toggle-text">
                    <ng-content />
                </span>
                <ng-content select="[kbqButtonSuffix]" />
            </div>
        </button>
    `,
    styleUrls: ['button-toggle.scss', 'button-toggle-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-button-toggle',
        '[class.kbq-button-toggle-icon]': 'iconType === "-icon"',
        '[class.kbq-button-toggle-icon-text]': 'iconType === "-icon-text"',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-selected]': 'checked',
        '(keydown)': 'onKeydown($event)'
    },
    exportAs: 'kbqButtonToggle'
})
export class KbqButtonToggle implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
    /** Group the toggle belongs to, or `null` for a standalone toggle. */
    protected readonly buttonToggleGroup = inject(KbqButtonToggleGroup, { optional: true });

    private changeDetectorRef = inject(ChangeDetectorRef);
    private focusMonitor = inject(FocusMonitor);
    private element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly directionality = inject(Directionality, { optional: true });

    private readonly icons = contentChildren(KbqIcon, { descendants: true });

    private readonly button = viewChild.required(KbqButton);

    /** Whether the button is checked. */
    @Input({ transform: booleanAttribute })
    get checked(): boolean {
        return this.checkedState();
    }

    set checked(value: boolean) {
        // Against the effective state rather than `_checked`, which a grouped toggle does not own:
        // its group selects it directly, so the two drift apart the moment a value is assigned.
        if (value === this.checked) {
            return;
        }

        this._checked.set(value);

        if (this.buttonToggleGroup) {
            this.buttonToggleGroup.syncButtonToggle(this, value);
        }
    }

    /**
     * Whether the toggle acts as a radio button (a single-selection group) or as a checkbox
     * (a multiple-selection group, or a standalone toggle).
     */
    get type(): ToggleType {
        return this.isSingleSelector() ? 'radio' : 'checkbox';
    }

    /**
     * Whether the toggle holds icons only (`-icon`), icons beside a label (`-icon-text`) or no icon
     * at all (`''`). Rendered as the `.kbq-button-toggle-icon`/`.kbq-button-toggle-icon-text` host
     * class, which is the only signal a stylesheet gets: CSS cannot see text nodes, so a selector can
     * never tell an icon-only toggle from a label that happens to contain an icon.
     */
    get iconType(): string {
        return this._iconType();
    }

    /** KbqButtonToggleGroup reads this to assign its own value. */
    @Input() value: any;

    /** Tabindex for the toggle. `null` leaves the toggle at its default position in the tab order. */
    readonly tabIndex = input<number | null>(null);

    /** Accessible name of the toggle. Required when the toggle projects nothing but icons. */
    readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

    /** Id of the element that labels the toggle. */
    readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

    /** Whether the toggle is disabled. A toggle inside a disabled group is disabled as well. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.disabledState();
    }

    set disabled(value: boolean) {
        this._disabled.set(value);
    }

    /** Event emitted when the group value changes. */
    readonly change = output<KbqButtonToggleChange>();

    private readonly _checked = signal(false);
    private readonly _disabled = signal(false);
    private readonly _iconType = signal('');

    /** Whether the missing-accessible-name warning has already been emitted for this toggle. */
    private accessibleNameWarned = false;

    /** Whether the toggle behaves like a radio button, i.e. sits in a single-selection group. */
    private readonly isSingleSelector = computed(() => !!this.buttonToggleGroup && !this.buttonToggleGroup.multiple());

    private readonly checkedState = computed(() =>
        this.buttonToggleGroup ? this.buttonToggleGroup.isSelected(this) : this._checked()
    );

    private readonly disabledState = computed(() => this._disabled() || !!this.buttonToggleGroup?.disabled);

    /**
     * A radio group is a single tab stop: Tab reaches the selected toggle — or the first enabled one
     * while nothing is selected — and the arrow keys move within the group from there. A
     * multiple-selection group is a set of independent toggle buttons, so every one of them stays in
     * the tab order.
     */
    protected readonly tabIndexValue = computed(() => {
        const own = this.tabIndex() ?? 0;

        if (!this.isSingleSelector()) {
            return own;
        }

        const toggles = this.buttonToggleGroup!.buttonToggles().filter((toggle) => !toggle.disabled);

        return (toggles.find((toggle) => toggle.checked) ?? toggles[0]) === this ? own : -1;
    });

    /**
     * A toggle in a single-selection group is a radio button; anywhere else it is a toggle button,
     * which is what a native `<button>` already is — it only needs its pressed state.
     */
    protected readonly role = computed(() => (this.isSingleSelector() ? 'radio' : null));

    /** Selected state of a radio; `null` outside a single-selection group, where `aria-pressed` says it. */
    protected readonly ariaChecked = computed(() => (this.isSingleSelector() ? this.checkedState() : null));

    /** Pressed state of a toggle button; `null` in a single-selection group, where `aria-checked` says it. */
    protected readonly ariaPressed = computed(() => (this.isSingleSelector() ? null : this.checkedState()));

    constructor() {
        // The content query only tracks KbqIcon instances, while `iconType` also depends on the text
        // nodes beside them, which the query cannot see — those are covered by the MutationObserver
        // in the template. This effect covers icons appearing or disappearing (e.g. via @if) without
        // waiting for the observer.
        effect(() => {
            this.icons();

            untracked(() => this.updateIconType());
        });
    }

    ngOnInit() {
        if (this.buttonToggleGroup && this.buttonToggleGroup.isPrechecked(this)) {
            this.checked = true;
        }
    }

    ngAfterContentInit(): void {
        this.updateIconType();
    }

    /**
     * Refreshes `iconType`, which tells whether the toggle holds icons only or icons beside a label.
     *
     * No selector can work this out: CSS cannot see text nodes, so it can never tell an icon-only
     * toggle from a label that happens to contain an icon.
     *
     * @docs-private
     */
    updateIconType(): void {
        const wrapper: HTMLElement | null = this.element.nativeElement.querySelector('.kbq-button-toggle-wrapper');
        const label = wrapper?.querySelector('.kbq-button-toggle-text');

        if (!wrapper || !label) return;

        const iconElements = this.icons().map((icon) => icon.getHostElement());

        // The label box belongs to the template rather than to the projected content, so it is
        // flattened out: an icon marked with `kbqButtonPrefix`/`kbqButtonSuffix` sits beside the box
        // and a legacy one inside it, and both have to be counted the same way. Same shape as
        // `KbqButtonCssStyler`, which flattens `.kbq-button-text` for the same reason.
        const nodes = getContentNodes(wrapper).flatMap((node) => (node === label ? getContentNodes(node) : [node]));

        this._iconType.set(iconElements.length ? (nodes.length === iconElements.length ? '-icon' : '-icon-text') : '');

        this.warnIfIconOnlyHasNoAccessibleName();
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.element.nativeElement, true);
    }

    ngOnDestroy() {
        const group = this.buttonToggleGroup;

        this.focusMonitor.stopMonitoring(this.element.nativeElement);

        // Remove the toggle from the selection once it's destroyed. Needs to happen
        // on the next tick in order to avoid "changed after checked" errors.
        if (group && group.isSelected(this)) {
            Promise.resolve().then(() => group.syncButtonToggle(this, false));
        }
    }

    /** Focuses the button. */
    focus(): void {
        this.button().focus();
    }

    /** Focuses the button as if the user had reached it with the keyboard, showing the focus ring. */
    focusViaKeyboard(): void {
        this.button().focusViaKeyboard();
    }

    /** Checks the button toggle due to an interaction with the underlying native button. */
    onToggleClick() {
        if (this.disabled) {
            return;
        }

        const newChecked = this.isSingleSelector() ? true : !this.checked;

        if (newChecked !== this.checked) {
            this._checked.set(newChecked);

            if (this.buttonToggleGroup) {
                this.buttonToggleGroup.syncButtonToggle(this, newChecked, true);
                this.buttonToggleGroup.onTouched();
            }
        }

        // Emitted for every interaction, including a re-click of an already selected radio, which
        // changes nothing: the toggle reports that it was activated, while the group above only
        // reports an actual change of value.
        this.change.emit(new KbqButtonToggleChange(this, this.value));
    }

    /**
     * Marks the button toggle as needing checking for change detection.
     *
     * Kept for back-compatibility. A toggle now derives `checked` and `disabled` from signals owned
     * by its group, so it re-renders on its own and nothing in the library calls this any more.
     */
    markForCheck() {
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Walks a radio group with the arrow keys, moving focus and selection together, as the WAI-ARIA
     * radiogroup pattern expects. A multiple-selection group is a set of independent toggle buttons
     * that Tab reaches one by one, so it needs no key handling of its own.
     */
    protected onKeydown(event: KeyboardEvent): void {
        if (!this.isSingleSelector()) return;

        const toggles = this.buttonToggleGroup!.buttonToggles().filter((toggle) => !toggle.disabled);
        const current = toggles.indexOf(this);

        if (current === -1) return;

        const rtl = this.directionality?.value === 'rtl';
        const { keyCode } = event;
        let next: number;

        if (keyCode === DOWN_ARROW || keyCode === (rtl ? LEFT_ARROW : RIGHT_ARROW)) {
            next = (current + 1) % toggles.length;
        } else if (keyCode === UP_ARROW || keyCode === (rtl ? RIGHT_ARROW : LEFT_ARROW)) {
            next = (current - 1 + toggles.length) % toggles.length;
        } else if (keyCode === HOME) {
            next = 0;
        } else if (keyCode === END) {
            next = toggles.length - 1;
        } else {
            return;
        }

        event.preventDefault();

        const target = toggles[next];

        target.focusViaKeyboard();
        target.onToggleClick();
    }

    /**
     * `KbqIcon` renders a decorative glyph, so an icon-only toggle carries no text. Without an
     * `aria-label`/`aria-labelledby` its button has no accessible name at all (AXE `button-name`).
     * `KbqButtonCssStyler` cannot warn about it here: a toggle projects its icons through its own
     * wrapper, so the button's own content query never sees them.
     *
     * A `title` on the host is deliberately not accepted as a name: the host is not the element the
     * accessible name is computed for — the inner button is — and the attribute never reaches it.
     */
    private warnIfIconOnlyHasNoAccessibleName(): void {
        if (!isDevMode() || this.accessibleNameWarned || this._iconType() !== '-icon') return;

        if (this.ariaLabel() || this.ariaLabelledby()) return;

        const host = this.element.nativeElement;

        this.accessibleNameWarned = true;

        // eslint-disable-next-line no-console
        console.warn(
            'KbqButtonToggle: icon-only toggle has no accessible name. Add [aria-label] or [aria-labelledby] to it.',
            host
        );
    }
}
