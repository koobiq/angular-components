import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ENTER, SPACE } from '@koobiq/cdk/keycodes';
import { Subject } from 'rxjs';
import { KBQ_TITLE_TEXT_REF, KbqTitleTextRef } from '../title';
import { KbqOptgroup } from './optgroup';

/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let uniqueIdCounter = 0;

/** Event object emitted by KbqOption when selected or deselected. */
export class KbqOptionSelectionChange<T = KbqOption> {
    constructor(
        public source: T,
        public isUserInput = false
    ) {}
}

/**
 * Describes a parent component that manages a list of options.
 * Contains properties that the options can inherit.
 * @docs-private
 */
export interface KbqOptionParentComponent {
    multiple?: boolean;
    multiSelection?: boolean;
    withVirtualScroll?: boolean;
}

/**
 * Handler that will update scroll position of elements inside overlay
 */
export interface KeyboardNavigationHandler {
    /** Scrolls the active option into view. */
    scrollActiveOptionIntoView(): void;
}

/**
 * Injection token used to provide the parent component to options.
 */
export const KBQ_OPTION_PARENT_COMPONENT = new InjectionToken<KbqOptionParentComponent>('KBQ_OPTION_PARENT_COMPONENT');

export abstract class KbqOptionBase {
    value: any;
    abstract get viewValue(): string;
    abstract get disabled(): boolean;
    abstract set disabled(value: any);

    abstract readonly onSelectionChange: EventEmitter<KbqOptionSelectionChange<any>>;

    abstract select(): void;

    abstract deselect(): void;

    /** Emits the selection change event. */
    protected emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new KbqOptionSelectionChange(this, isUserInput));
    }
}

export class KbqVirtualOption extends KbqOptionBase {
    get disabled() {
        return this._disabled;
    }
    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);
    }

    get selected(): boolean {
        return this._selected;
    }

    private _selected = false;

    get viewValue(): string {
        return this.value;
    }

    readonly onSelectionChange = new EventEmitter<KbqOptionSelectionChange<KbqVirtualOption>>();

    constructor(
        public value: any,
        private _disabled: boolean = false
    ) {
        super();
    }

    select(): void {
        if (!this._selected) {
            this._selected = true;

            this.emitSelectionChangeEvent();
        }
    }

    deselect(): void {
        if (this._selected) {
            this._selected = false;

            this.emitSelectionChangeEvent();
        }
    }
}

/**
 * Single option inside of a `<kbq-select>` element.
 */
@Component({
    selector: 'kbq-option',
    exportAs: 'kbqOption',
    host: {
        '[attr.tabindex]': 'getTabIndex()',
        class: 'kbq-option',
        '[class.kbq-selected]': 'selected',
        '[class.kbq-option-multiple]': 'multiple',
        '[class.kbq-active]': 'active',
        '[class.kbq-disabled]': 'disabled',
        '[id]': 'id',

        '(click)': 'selectViaInteraction()',
        '(keydown)': 'handleKeydown($event)'
    },
    /* Component inherits styles from `list`, so `list` variables are imported as the single source of truth. */
    styleUrls: ['option.scss', 'option-tokens.scss'],
    templateUrl: 'option.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: KBQ_TITLE_TEXT_REF,
            useExisting: KbqOption
        }
    ]
})
export class KbqOption extends KbqOptionBase implements AfterViewChecked, OnDestroy, KbqTitleTextRef {
    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    /** The form value of the option. */
    @Input() value: any;

    @Input({ transform: booleanAttribute }) selectable: boolean = true;

    // todo this flag will need to be rethought in the future (added for filter panel)
    @Input({ transform: booleanAttribute }) userSelect: boolean = false;

    @Input()
    get showCheckbox() {
        return this._showCheckbox === undefined ? this.multiple : this._showCheckbox;
    }

    set showCheckbox(value) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

    /** Event emitted when the option is selected or deselected. */
    @Output() readonly onSelectionChange = new EventEmitter<KbqOptionSelectionChange>();

    /** Emits when the state of the option changes and any parents have to be notified. */
    readonly stateChanges = new Subject<void>();

    /**
     * The displayed value of the option. It is necessary to show the selected option in the
     * select's trigger.
     */
    @Input()
    get viewValue(): string {
        if (this.parent?.withVirtualScroll) return this.value;

        return this._viewValue || (this.getHostElement().textContent || '').trim();
    }

    set viewValue(value: string) {
        this._viewValue = value;
    }

    private _viewValue: string;

    /** Whether the wrapping component is in multiple selection mode. */
    get multiple(): boolean {
        return !!this.parent?.multiSelection;
    }

    get id(): string {
        return this._id;
    }

    private _id = `kbq-option-${uniqueIdCounter++}`;

    get selected(): boolean {
        return this._selected;
    }

    private _selected = false;

    @Input()
    get disabled() {
        return (this.group && this.group.disabled) || this._disabled;
    }

    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled = false;

    /**
     * Whether or not the option is currently active and ready to be selected.
     * An active option displays styles as if it is focused, but the
     * focus is actually retained somewhere else. This comes in handy
     * for components like autocomplete where focus must remain on the input.
     */
    get active(): boolean {
        return this._active;
    }

    private _active = false;

    private mostRecentViewValue = '';

    constructor(
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(KBQ_OPTION_PARENT_COMPONENT) private readonly parent: KbqOptionParentComponent,
        @Optional() readonly group: KbqOptgroup
    ) {
        super();
    }

    ngAfterViewChecked() {
        // Since parent components could be using the option's label to display the selected values
        // (e.g. `kbq-select`) and they don't have a way of knowing if the option's label has changed
        // we have to check for changes in the DOM ourselves and dispatch an event. These checks are
        // relatively cheap, however we still limit them only to selected options in order to avoid
        // hitting the DOM too often.
        if (this._selected) {
            const viewValue = this.viewValue;

            if (viewValue !== this.mostRecentViewValue) {
                this.mostRecentViewValue = viewValue;
                this.stateChanges.next();
            }
        }
    }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    /** @docs-private */
    getHeight(): number {
        const element = this.elementRef.nativeElement;

        // For SSR compatibility
        if (typeof element.getClientRects !== 'function') return 0;

        return element.getClientRects()[0]?.height ?? 0;
    }

    select(emitEvent: boolean = true): void {
        if (!this._selected) {
            this._selected = true;

            this.changeDetectorRef.markForCheck();
            if (emitEvent) this.emitSelectionChangeEvent();
        }
    }

    deselect(emitEvent: boolean = true): void {
        if (this._selected) {
            this._selected = false;

            this.changeDetectorRef.markForCheck();
            if (emitEvent) this.emitSelectionChangeEvent();
        }
    }

    focus(): void {
        const element = this.getHostElement();

        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    /**
     * This method sets display styles on the option to make it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setActiveStyles(): void {
        if (!this._active) {
            this._active = true;
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * This method removes display styles on the option that made it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setInactiveStyles(): void {
        if (this._active) {
            this._active = false;
            this.changeDetectorRef.markForCheck();
        }
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        return this.viewValue;
    }

    /** Ensures the option is selected when activated from the keyboard. */
    handleKeydown(event: KeyboardEvent): void {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.selectViaInteraction();

            // Prevent the page from scrolling down and form submits.
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /**
     * `Selects the option while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    selectViaInteraction(): void {
        if (this.userSelect) return;

        if (!this.disabled && this.selectable) {
            this._selected = this.multiple ? !this._selected : true;

            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);
        }
    }

    getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}

/**
 * Counts the amount of option group labels that precede the specified option.
 * @param optionIndex Index of the option at which to start counting.
 * @param options Flat list of all of the options.
 * @param optionGroups Flat list of all of the option groups.
 * @docs-private
 */
export function countGroupLabelsBeforeOption(
    optionIndex: number,
    options: QueryList<KbqOption>,
    optionGroups: QueryList<KbqOptgroup>
): number {
    if (optionGroups.length) {
        const optionsArray = options.toArray();
        const groups = optionGroups.toArray();

        let groupCounter = 0;

        for (let i = 0; i < optionIndex + 1; i++) {
            if (optionsArray[i].group && optionsArray[i].group === groups[groupCounter]) {
                groupCounter++;
            }
        }

        return groupCounter;
    }

    return 0;
}

/**
 * Determines the position to which to scroll a panel in order for an option to be into view.
 * @param optionIndex Index of the option to be scrolled into the view.
 * @param optionHeight Height of the options.
 * @param currentScrollPosition Current scroll position of the panel.
 * @param panelHeight Height of the panel.
 * @docs-private
 */
export function getOptionScrollPosition(
    optionIndex: number,
    optionHeight: number,
    currentScrollPosition: number,
    panelHeight: number
): number {
    const optionOffset = optionIndex * optionHeight;

    if (optionOffset < currentScrollPosition) {
        return optionOffset;
    }

    if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
        return Math.max(0, optionOffset - panelHeight + optionHeight);
    }

    return currentScrollPosition;
}
