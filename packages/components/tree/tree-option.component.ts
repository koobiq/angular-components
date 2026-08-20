import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    contentChild,
    ElementRef,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    input,
    NgZone,
    output,
    QueryList,
    signal,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    hasModifierKey,
    KBQ_OPTION_ACTION_PARENT,
    KBQ_TITLE_TEXT_REF,
    KbqActionContainer,
    kbqFocusAndReveal,
    kbqFocusOptionActionOnTab,
    kbqGetElementHeight,
    KbqOptionActionComponent,
    KbqPseudoCheckbox,
    KbqPseudoCheckboxState,
    KbqTitleTextRef
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { FlatTreeControl } from './control/flat-tree-control';
import { KbqTreeNodeToggleBaseDirective, KbqTreeNodeToggleComponent, KbqTreeNodeToggleDirective } from './toggle';
import { KbqTreeBase, KbqTreeNode } from './tree-base';

export interface KbqTreeOptionEvent {
    option: KbqTreeOption;
}

/**
 * The part of the tree an option talks to.
 *
 * Declared as an interface rather than as `KbqTreeSelection` so the token stays free of a circular
 * import, and so anything embedding options only has to provide these members.
 */
export interface KbqTreeOptionParent {
    /** Whether the whole tree is disabled. */
    disabled: boolean;
    /** Whether more than one option can be selected at a time. */
    multiple: boolean;
    /** Whether the options render a checkbox. */
    showCheckbox: boolean;
    /** Whether the tree is rendered inside a select panel, which makes hovering an option focus it. */
    inSelect: boolean;
    /** Whether an option keeps focus while the tree loses it, as a select with a search field needs. */
    optionShouldHoldFocusOnBlur: boolean;
    /** State of the tree-level "select all" checkbox. */
    selectAllState: KbqPseudoCheckboxState;
    treeControl: FlatTreeControl<any>;
    selectionModel: SelectionModel<any>;
    unorderedOptions: QueryList<KbqTreeOption>;
    setSelectedOptionsByClick(option: KbqTreeOption, shiftKey: boolean, ctrlKey: boolean): void;
}

/** Injection token used to provide the parent component to options. */
export const KBQ_TREE_OPTION_PARENT_COMPONENT = new InjectionToken<KbqTreeOptionParent>(
    'KBQ_TREE_OPTION_PARENT_COMPONENT'
);

/**
 * Represents a change event for a tree option.
 *
 * @param source - The tree option that has been modified or selected.
 * @param isUserInput - DEPRECATED Will be removed in version 20.
 */
export class KbqTreeOptionChange {
    /** @deprecated Will be removed in version 20. */
    isUserInput: boolean;

    constructor(
        public source: KbqTreeOption,
        /** @deprecated Will be removed in version 20. */
        isUserInput = false
    ) {
        this.isUserInput = isUserInput;
    }
}

let uniqueIdCounter: number = 0;

@Component({
    selector: 'kbq-tree-option',
    imports: [
        KbqPseudoCheckbox,
        KbqActionContainer
    ],
    templateUrl: './tree-option.html',
    styleUrls: ['./tree-option.scss', './tree-tokens.scss'],
    providers: [
        { provide: KbqTreeNode, useExisting: KbqTreeOption },
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqTreeOption },
        { provide: KBQ_OPTION_ACTION_PARENT, useExisting: KbqTreeOption }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tree-option',
        // The "select all" row is a treeitem too: `role="checkbox"` would be an invalid child of
        // `role="tree"`, and `aria-checked` already carries its state.
        role: 'treeitem',
        '[class.kbq-tree-option_multiple]': 'tree.multiple',
        '[class.kbq-selected]': 'selected',
        '[class.kbq-focused]': 'hasFocus',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-action-button-focused]': 'actionButton()?.active',
        '[attr.id]': 'id',
        '[attr.tabindex]': '-1',
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.aria-expanded]': 'isExpandable ? isExpanded : null',
        '[attr.aria-level]': 'level + 1',
        '[attr.aria-checked]': 'ariaChecked',
        '[attr.aria-selected]': 'ariaSelected',
        '(focusin)': 'focus()',
        '(mouseenter)': 'onMouseenter()',
        '(blur)': 'blur()',
        '(click)': 'selectViaInteraction($event)',
        '(keydown)': 'onKeydown($event)'
    },
    exportAs: 'kbqTreeOption'
})
export class KbqTreeOption extends KbqTreeNode<KbqTreeOption> implements AfterContentInit, KbqTitleTextRef {
    private changeDetectorRef = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);
    // Intersected with the rendering base because `KbqTreeNode` resolves its level and expansion state
    // through it; the option itself only ever touches the `KbqTreeOptionParent` half.
    override tree: KbqTreeOptionParent & KbqTreeBase<any>;

    private readonly focusEvents = new Subject<KbqTreeOptionEvent>();

    private readonly blurEvents = new Subject<KbqTreeOptionEvent>();

    /** Emits when the option takes focus. */
    readonly onFocus: Observable<KbqTreeOptionEvent> = this.focusEvents.asObservable();

    /** Emits when the option loses focus. */
    readonly onBlur: Observable<KbqTreeOptionEvent> = this.blurEvents.asObservable();

    preventBlur: boolean = false;

    @ViewChild('kbqTitleContainer') parentTextElement: ElementRef;

    // Same element as `parentTextElement` — `.kbq-option-text` clips the text, so it is measured against itself.
    get textElement(): ElementRef {
        return this.parentTextElement;
    }

    readonly toggleElementDirective = contentChild(KbqTreeNodeToggleDirective);
    readonly toggleElementComponent = contentChild(KbqTreeNodeToggleComponent);
    readonly pseudoCheckbox = contentChild(KbqPseudoCheckbox);
    readonly actionButton = contentChild(KbqOptionActionComponent);

    // `KbqOptionActionComponent` reads these as directive instances through KBQ_OPTION_ACTION_PARENT,
    // so they must stay decorator queries. A signal `contentChild` would expose the query function
    // instead of the trigger, making `dropdownTrigger.dropdownClosed` undefined and throwing on `.pipe`
    // when an action button is rendered (e.g. on tree node expansion) — see #DS-5079.
    @ContentChild(KbqTooltipTrigger) tooltipTrigger?: KbqTooltipTrigger;
    @ContentChild(KbqDropdownTrigger) dropdownTrigger?: KbqDropdownTrigger;

    readonly checkboxThirdState = input<boolean>(false);

    get externalPseudoCheckbox(): boolean {
        return !!this.pseudoCheckbox();
    }

    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get disabled(): boolean {
        if (this.selectAllRow()) {
            return this._disabled || this.tree.disabled;
        }

        return this._disabled || this.tree.disabled || this.tree.treeControl.isDisabled(this.data);
    }

    set disabled(value: BooleanInput) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
        }
    }

    private _disabled: boolean = false;

    /**
     * Whether the option can be selected by user interaction (click, keyboard, select all).
     * A non-selectable option remains focusable, navigable and expandable.
     * Programmatic selection (`setSelected`, `select`, value accessor) is not affected.
     * Options that are not rendered (e.g. collapsed) are not checked by "select all".
     */
    readonly selectable = input<boolean, unknown>(true, { transform: booleanAttribute });

    /**
     * Whether this option is the tree's "select all" row rather than a rendered data node.
     *
     * Such a row has no `data`, so everything that would resolve the option against the tree control
     * (`getValue`, `isDisabled`, `isExpandable`, descendants) is skipped — those accessors belong to the
     * consumer and must never be handed a node their data source has never seen. Its checkbox state and
     * selection are driven from the outside instead.
     * @docs-private
     */
    readonly selectAllRow = input<boolean, unknown>(false, { transform: booleanAttribute });

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get showCheckbox(): boolean {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.tree.showCheckbox;
    }

    set showCheckbox(value: BooleanInput) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

    /** Emits whenever the selected state of the option changes. */
    readonly selectionChange = output<KbqTreeOptionChange>();

    /** @deprecated Use `selectionChange` instead. Will be removed in version 20. */
    readonly onSelectionChange = output<KbqTreeOptionChange>({ alias: 'onSelectionChange' });

    // Not an `output()`: `KbqTreeSelect` merges this stream with rxjs, which an `OutputEmitterRef`
    // cannot feed without wrapping every call site in `outputToObservable`.
    readonly userInteraction = new EventEmitter<void>();

    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        const isSelected = coerceBooleanProperty(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);
        }
    }

    private _selected: boolean = false;

    get id(): string {
        return this._id;
    }

    private _id = `kbq-tree-option-${uniqueIdCounter++}`;

    get viewValue(): string {
        // TODO: Add input property alternative for node envs.
        return (this.getHostElement().textContent || '').trim();
    }

    get hasFocus(): boolean {
        return this.focused();
    }

    set hasFocus(value: boolean) {
        this.focused.set(value);
    }

    private readonly focused = signal(false);

    get isExpandable(): boolean {
        if (this.selectAllRow()) {
            return false;
        }

        return !this.toggleElement?.disabled && this.tree.treeControl.isExpandable(this.data);
    }

    /** The "select all" row sits above the tree at root depth; `getLevel` has no node to resolve for it. */
    override get level(): number {
        return this.selectAllRow() ? 0 : super.level;
    }

    get toggleElement(): KbqTreeNodeToggleBaseDirective<KbqTreeOption> | undefined {
        return this.toggleElementComponent() || this.toggleElementDirective();
    }

    get isToggleInDefaultPlace(): boolean {
        return !!(this.toggleElementDirective() || this.toggleElementComponent());
    }

    get checkboxState(): KbqPseudoCheckboxState {
        return this.checkbox();
    }

    set checkboxState(value: KbqPseudoCheckboxState) {
        this.checkbox.set(value);
    }

    private readonly checkbox = signal<KbqPseudoCheckboxState>('unchecked');

    /**
     * `aria-checked` of the row: tri-state for a checkbox option, and the "select all" state for the
     * row that drives it. `null` for a plain option, which reports `aria-selected` instead.
     */
    protected get ariaChecked(): string | null {
        if (this.selectAllRow()) {
            return this.toAriaChecked(this.tree.selectAllState);
        }

        return this.showCheckbox ? this.toAriaChecked(this.checkboxState) : null;
    }

    /** `aria-selected` of the row. Options with a checkbox report `aria-checked` instead. */
    protected get ariaSelected(): boolean | null {
        return this.selectAllRow() || this.showCheckbox ? null : this.selected;
    }

    constructor() {
        const tree = inject(KBQ_TREE_OPTION_PARENT_COMPONENT) as KbqTreeOptionParent & KbqTreeBase<any>;

        super();

        this.tree = tree;
    }

    ngAfterContentInit(): void {
        if (this.selectAllRow()) return;

        Promise.resolve().then(this.updateCheckboxState);

        this.value = this.tree.treeControl.getValue(this.data);
    }

    descendantsAllSelected(): boolean {
        const descendants = this.tree.treeControl.getDescendants(this.data);

        return descendants.every((child) => this.tree?.selectionModel.isSelected(child));
    }

    descendantsPartiallySelected(): boolean {
        const descendants = this.tree.treeControl.getDescendants(this.data);

        return descendants.some((child) => this.tree?.selectionModel.isSelected(child));
    }

    updateParentsCheckboxState(node) {
        this.tree.treeControl.getParents(node, []).forEach((parent) => {
            const parentOption = this.tree.unorderedOptions.find((option) => option.data === parent);

            parentOption?.updateCheckboxState();
        });
    }

    updateCheckboxState = () => {
        if (this.selectAllRow()) return;

        if (this.checkboxThirdState() && this.isExpandable) {
            // One descendant walk, not two: `getDescendants` is a linear scan of the whole data set, and
            // the roll-up below repeats this method for every ancestor.
            const descendants = this.tree.treeControl.getDescendants(this.data);
            const selectedCount = descendants.filter((child) => this.tree.selectionModel.isSelected(child)).length;

            if (selectedCount === descendants.length) {
                this.checkboxState = 'checked';
            } else if (selectedCount > 0) {
                this.checkboxState = 'indeterminate';
            } else {
                this.checkboxState = this.selected ? 'checked' : 'unchecked';
            }
        } else {
            this.checkboxState = this.selected ? 'checked' : 'unchecked';
        }

        this.updateParentsCheckboxState(this.data);
    };

    toggle(): void {
        this.selected = !this.selected;
    }

    setSelected(selected: boolean): void {
        if (this.selectAllRow() || this._selected === selected || !this.tree.selectionModel) {
            return;
        }

        this._selected = selected;

        if (selected) {
            this.tree.selectionModel.select(this.data);
        } else {
            this.tree.selectionModel.deselect(this.data);
        }

        if (this.showCheckbox) {
            this.updateCheckboxState();
        }

        this.markForCheck();
    }

    focus(focusOrigin?: FocusOrigin) {
        if (focusOrigin === 'program' || this.disabled || this.actionButton()?.hasFocus) return;

        // With the pointer already on this node, revealing it would shift the tree out from under it.
        kbqFocusAndReveal(this.elementRef.nativeElement, focusOrigin === 'mouse');

        if (!this.hasFocus) {
            this.focusEvents.next({ option: this });

            Promise.resolve().then(() => {
                this.hasFocus = true;

                this.markForCheck();
            });
        }
    }

    blur(): void {
        if (this.preventBlur) {
            return;
        }

        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the tree
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.ngZone.run(() => {
                    if (this.actionButton()?.hasFocus || this.tree.optionShouldHoldFocusOnBlur) {
                        return;
                    }

                    this.hasFocus = false;

                    this.blurEvents.next({ option: this });
                });
            });
    }

    /** @docs-private */
    getHeight(): number {
        return kbqGetElementHeight(this.elementRef.nativeElement);
    }

    /**
     * Label the key manager's type-ahead matches against.
     *
     * The "select all" row is navigable but is not a data node, and its label is a localized phrase —
     * answering type-ahead with it would hijack every query starting with that letter.
     * @docs-private
     */
    getLabel(): string {
        return this.selectAllRow() ? '' : this.viewValue;
    }

    select(setFocus = true): void {
        if (this.selectAllRow() || this._selected) {
            return;
        }

        this._selected = true;

        if (setFocus && !this.hasFocus) {
            this.focus();
        }

        this.updateCheckboxState();
        this.markForCheck();
        this.emitSelectionChangeEvent();
    }

    deselect(): void {
        if (this.selectAllRow() || !this._selected) {
            return;
        }

        this._selected = false;

        this.updateCheckboxState();

        this.markForCheck();
        this.emitSelectionChangeEvent();
    }

    onKeydown($event) {
        kbqFocusOptionActionOnTab($event, this.actionButton());
    }

    selectViaInteraction($event?: KeyboardEvent): void {
        if (this.disabled || !this.selectable()) {
            return;
        }

        this.markForCheck();

        this.userInteraction.emit();

        const shiftKey = $event ? hasModifierKey($event, 'shiftKey') : false;
        // ctrlKey is for Windows, metaKey is for MacOS
        const ctrlKey = $event ? hasModifierKey($event, 'ctrlKey', 'metaKey') : false;

        this.tree.setSelectedOptionsByClick(this, shiftKey, ctrlKey);
    }

    emitSelectionChangeEvent(): void {
        const event = new KbqTreeOptionChange(this);

        this.selectionChange.emit(event);
        this.onSelectionChange.emit(event);
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    markForCheck() {
        this.changeDetectorRef.markForCheck();

        if (this.showCheckbox) {
            this.updateCheckboxState();
        }
    }

    /** @docs-private */
    protected onMouseenter() {
        if (this.disabled || !this.tree.inSelect) return;

        this.focus('mouse');
    }

    private toAriaChecked(state: KbqPseudoCheckboxState): string {
        return state === 'indeterminate' ? 'mixed' : `${state === 'checked'}`;
    }
}
