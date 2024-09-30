import { FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TAB, hasModifierKey } from '@koobiq/cdk/keycodes';
import {
    KBQ_OPTION_ACTION_PARENT,
    KBQ_TITLE_TEXT_REF,
    KbqOptionActionComponent,
    KbqPseudoCheckbox,
    KbqPseudoCheckboxState,
    KbqTitleTextRef
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { KbqTreeNodeToggleBaseDirective, KbqTreeNodeToggleComponent, KbqTreeNodeToggleDirective } from './toggle';
import { KbqTreeNode } from './tree-base';

export interface KbqTreeOptionEvent {
    option: KbqTreeOption;
}

/**
 * Injection token used to provide the parent component to options.
 */
export const KBQ_TREE_OPTION_PARENT_COMPONENT = new InjectionToken<any>('KBQ_TREE_OPTION_PARENT_COMPONENT');

export class KbqTreeOptionChange {
    constructor(
        public source: KbqTreeOption,
        public isUserInput = false
    ) {}
}

let uniqueIdCounter: number = 0;

@Component({
    selector: 'kbq-tree-option',
    exportAs: 'kbqTreeOption',
    templateUrl: './tree-option.html',
    styleUrls: ['./tree-option.scss', './tree-tokens.scss'],
    host: {
        class: 'kbq-tree-option',
        '[class.kbq-selected]': 'selected',
        '[class.kbq-focused]': 'hasFocus',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-action-button-focused]': 'actionButton?.active',

        '[attr.id]': 'id',
        '[attr.tabindex]': '-1',
        '[attr.disabled]': 'disabled || null',

        '(focusin)': 'focus()',
        '(blur)': 'blur()',

        '(click)': 'selectViaInteraction($event)',
        '(keydown)': 'onKeydown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: KbqTreeNode, useExisting: KbqTreeOption },
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqTreeOption },
        { provide: KBQ_OPTION_ACTION_PARENT, useExisting: KbqTreeOption }
    ]
})
export class KbqTreeOption extends KbqTreeNode<KbqTreeOption> implements AfterContentInit, KbqTitleTextRef {
    readonly onFocus = new Subject<KbqTreeOptionEvent>();

    readonly onBlur = new Subject<KbqTreeOptionEvent>();

    preventBlur: boolean = false;

    @ViewChild('kbqTitleContainer') parentTextElement: ElementRef;
    @ContentChild(KbqTreeNodeToggleDirective) toggleElementDirective: KbqTreeNodeToggleBaseDirective<KbqTreeOption>;
    @ContentChild(KbqTreeNodeToggleComponent) toggleElementComponent: KbqTreeNodeToggleBaseDirective<KbqTreeOption>;
    @ContentChild(KbqPseudoCheckbox) pseudoCheckbox: KbqPseudoCheckbox;
    @ContentChild(KbqOptionActionComponent) actionButton: KbqOptionActionComponent;
    @ContentChild(KbqTooltipTrigger) tooltipTrigger: KbqTooltipTrigger;
    @ContentChild(KbqDropdownTrigger) dropdownTrigger: KbqDropdownTrigger;

    @Input() checkboxThirdState: boolean = false;

    get externalPseudoCheckbox(): boolean {
        return !!this.pseudoCheckbox;
    }

    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    @Input()
    get disabled() {
        return this._disabled || this.tree!.disabled || this.tree.treeControl.isDisabled(this.data);
    }

    set disabled(value: any) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
        }
    }

    private _disabled: boolean = false;

    @Input()
    get showCheckbox() {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.tree.showCheckbox;
    }

    set showCheckbox(value: any) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

    @Output() readonly onSelectionChange = new EventEmitter<KbqTreeOptionChange>();
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

    hasFocus: boolean = false;

    get isExpandable(): boolean {
        return !this.toggleElement?.disabled && this.tree.treeControl.isExpandable(this.data);
    }

    get toggleElement(): KbqTreeNodeToggleBaseDirective<KbqTreeOption> {
        return this.toggleElementComponent || this.toggleElementDirective;
    }

    get isToggleInDefaultPlace(): boolean {
        return !!(this.toggleElementDirective || this.toggleElementComponent);
    }

    checkboxState: KbqPseudoCheckboxState;

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private ngZone: NgZone,
        @Inject(KBQ_TREE_OPTION_PARENT_COMPONENT) public tree: any
    ) {
        super(elementRef, tree);
    }

    ngAfterContentInit(): void {
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
        if (this.checkboxThirdState && this.isExpandable) {
            if (this.descendantsAllSelected()) {
                this.checkboxState = 'checked';
            } else if (this.descendantsPartiallySelected()) {
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
        if (this._selected === selected || !this.tree.selectionModel) {
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
        if (focusOrigin === 'program') {
            return;
        }

        if (this.disabled || this.actionButton?.hasFocus) {
            return;
        }

        this.elementRef.nativeElement.focus();

        if (!this.hasFocus) {
            this.onFocus.next({ option: this });

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
                    if (this.actionButton?.hasFocus || this.tree.optionShouldHoldFocusOnBlur) {
                        return;
                    }

                    this.hasFocus = false;

                    this.onBlur.next({ option: this });
                });
            });
    }

    getHeight(): number {
        const clientRects = this.elementRef.nativeElement.getClientRects();

        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
    }

    select(setFocus = true): void {
        if (this._selected) {
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
        if (!this._selected) {
            return;
        }

        this._selected = false;

        this.updateCheckboxState();

        this.markForCheck();
        this.emitSelectionChangeEvent();
    }

    onKeydown($event) {
        if (!this.actionButton) {
            return;
        }

        if ($event.keyCode === TAB && !$event.shiftKey && !this.actionButton.hasFocus) {
            this.actionButton.focus();

            $event.preventDefault();
        }
    }

    selectViaInteraction($event?: KeyboardEvent): void {
        if (this.disabled) {
            return;
        }

        this.markForCheck();

        this.userInteraction.emit();

        const shiftKey = $event ? hasModifierKey($event, 'shiftKey') : false;
        const ctrlKey = $event ? hasModifierKey($event, 'ctrlKey') : false;

        this.tree.setSelectedOptionsByClick(this, shiftKey, ctrlKey);
    }

    emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new KbqTreeOptionChange(this, isUserInput));
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
}
