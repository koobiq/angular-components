import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { BACKSPACE, END, HOME, LEFT_ARROW, TAB } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    DoCheck,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    Self,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import { FocusKeyManager } from '@koobiq/cdk/a11y';
import { isSelectAll } from '@koobiq/cdk/keycodes';
import { CanUpdateErrorState, ErrorStateMatcher, isNull, KbqOrientation } from '@koobiq/components/core';
import { KbqCleaner, KbqFormFieldControl } from '@koobiq/components/form-field';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, startWith } from 'rxjs/operators';
import { KbqTagTextControl } from './tag-text-control';
import {
    KbqTag,
    KbqTagDragData,
    KbqTagEditChange,
    KbqTagEvent,
    KbqTagFocusEvent,
    KbqTagSelectionChange
} from './tag.component';

// Increasing integer for generating unique ids for tag-list components.
let nextUniqueId = 0;

/** Change event object that is emitted when the tag list value has changed. */
export class KbqTagListChange {
    constructor(
        public source: KbqTagList,
        public value: any
    ) {}
}

export type KbqTagListDroppedEvent = Pick<CdkDragDrop<unknown>, 'event' | 'previousIndex' | 'currentIndex'> & {
    tag: KbqTag;
};

@Component({
    selector: 'kbq-tag-list',
    exportAs: 'kbqTagList',
    template: `
        <div class="kbq-tags-list__list-container">
            <ng-content />
        </div>

        @if (canShowCleaner) {
            <div class="kbq-tags-list__cleaner">
                <ng-content select="kbq-cleaner" />
            </div>
        }
    `,
    styleUrls: ['tag-list.scss', 'tag-tokens.scss'],
    host: {
        class: 'kbq-tag-list',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-invalid]': 'errorState',
        '[class.kbq-tag-list_selectable]': 'selectable',
        '[class.kbq-tag-list_editable]': 'editable',
        '[class.kbq-tag-list_removable]': 'removable',
        '[class.kbq-tag-list_draggable]': 'draggable',

        '[attr.tabindex]': 'tabIndex',
        '[id]': 'uid',

        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(keydown)': 'keydown($event)'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: KbqFormFieldControl, useExisting: KbqTagList }],
    hostDirectives: [CdkDropList]
})
export class KbqTagList
    implements
        KbqFormFieldControl<any>,
        ControlValueAccessor,
        AfterContentInit,
        DoCheck,
        OnDestroy,
        CanUpdateErrorState,
        AfterViewInit
{
    private readonly dropList = inject(CdkDropList, { host: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly focusMonitor = inject(FocusMonitor);

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly controlType: string = 'tag-list';

    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     * @docs-private
     */
    readonly stateChanges = new Subject<void>();

    /**
     * Combined stream of all of the child tags' selection change events.
     *
     * @docs-private
     */
    get tagSelectionChanges(): Observable<KbqTagSelectionChange> {
        return merge(...this.tags.map((tag) => tag.selectionChange));
    }

    /**
     * Combined stream of all of the child tags' focus change events.
     *
     * @docs-private
     */
    get tagFocusChanges(): Observable<KbqTagFocusEvent> {
        return merge(...this.tags.map((tag) => tag.onFocus));
    }

    /**
     * Combined stream of all of the child tags' blur change events.
     *
     * @docs-private
     */
    get tagBlurChanges(): Observable<KbqTagEvent> {
        return merge(...this.tags.map((tag) => tag.onBlur));
    }

    /**
     * Combined stream of all of the child tags' remove change events.
     *
     * @docs-private
     */
    get tagRemoveChanges(): Observable<KbqTagEvent> {
        return merge(...this.tags.map((tag) => tag.destroyed));
    }

    /**
     * Combined stream of all of the child tags' edit change events.
     *
     * @docs-private
     */
    get tagEditChanges(): Observable<KbqTagEditChange> {
        return merge(...this.tags.map((tag) => tag.editChange));
    }

    /**
     * The array of selected tags inside tag list.
     *
     * @docs-private
     */
    get selected(): KbqTag[] {
        return this.tags.filter(({ selected }) => selected);
    }

    /** @docs-private */
    get canShowCleaner(): boolean {
        return this.cleaner && this.tags.length > 0;
    }

    /**
     * @deprecated Unused. Will be removed in next major release.
     *
     * @docs-private
     */
    @Input({ transform: booleanAttribute }) multiple: boolean = false;

    /**
     * A function to compare the option values with the selected values. The first argument
     * is a value from an option. The second is a value from the selection. A boolean
     * should be returned.
     *
     * @deprecated Unused. Will be removed in next major release.
     */
    @Input() compareWith = (o1: any, o2: any) => o1 === o2;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get id(): string {
        return this.tagInput ? this.tagInput.id : this.uid;
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
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
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    get placeholder(): string {
        return this.tagInput ? this.tagInput.placeholder : this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;
        this.stateChanges.next();
    }

    private _placeholder: string;

    /** Whether any tags or the kbqTagInput inside of this tag-list has focus. */
    get focused(): boolean {
        return (this.tagInput && this.tagInput.focused) || this.hasFocusedTag();
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return (!this.tagInput || this.tagInput.empty) && this.tags.length === 0;
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get shouldLabelFloat(): boolean {
        return !this.empty || this.focused;
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.ngControl ? !!this.ngControl.disabled : this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
        this.syncDropListDisabledState();
    }

    private _disabled: boolean = false;

    @Input({ transform: booleanAttribute })
    get draggable(): boolean {
        return this._draggable && !this.disabled;
    }

    set draggable(value: boolean) {
        this._draggable = value;
        this.syncDropListDisabledState();
    }

    private _draggable: boolean = false;

    /**
     * Emits when the user drops tag inside tag list container.
     */
    @Output() readonly dropped = new EventEmitter<KbqTagListDroppedEvent>();

    /**
     * Whether or not this tag list is selectable. When a tag list is not selectable,
     * the selected states for all the tags inside the tag list are always ignored.
     */
    @Input({ transform: booleanAttribute }) selectable = true;

    /** Whether the tags in the list are editable. */
    @Input({ transform: booleanAttribute }) editable = false;

    /**
     * Whether to emit change events when tags are added/removed.
     * Set to `false` to prevent the form control from being marked as dirty during programmatic updates.
     */
    @Input({ transform: booleanAttribute }) emitOnTagChanges = true;

    /** Whether the tags in the list are removable. */
    @Input({ transform: booleanAttribute })
    get removable(): boolean {
        return this._removable;
    }

    set removable(value: boolean) {
        this._removable = value;
        this.syncTagsRemovableState();
    }

    private _removable = true;

    /**
     * Tab index of the tag list. This property is ignored when the tag list contains a tag input or is disabled.
     *
     * @docs-private
     */
    @Input()
    get tabIndex(): number | null {
        return this.disabled || this.tagInput ? null : this._tabIndex;
    }

    set tabIndex(value: number) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    /**
     * Event that emits whenever the raw value of the tag-list changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

    /** @docs-private */
    uid: string = `kbq-tag-list-${nextUniqueId++}`;

    /**
     * User defined tab index.
     * When it is not null, use user defined tab index. Otherwise use tabIndex
     *
     * @docs-private
     */
    userTabIndex: number | null = null;

    /** @docs-private */
    keyManager: FocusKeyManager<KbqTag>;

    /**
     * @docs-private
     *
     * @deprecated Unused. Will be removed in next major release.
     */
    selectionModel: SelectionModel<KbqTag>;

    /**
     * @docs-private
     *
     * @deprecated Unused. Will be removed in next major release.
     */
    tagChanges = new EventEmitter<any>();

    /** An object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Orientation of the tag list.
     *
     * @deprecated Unused. Will be removed in next major release.
     */
    @Input() orientation: KbqOrientation = 'horizontal';

    /** Event emitted when the selected tag list value has been changed by the user. */
    @Output() readonly change: EventEmitter<KbqTagListChange> = new EventEmitter<KbqTagListChange>();

    /** @docs-private */
    @ContentChild('kbqTagListCleaner', { static: true }) cleaner: KbqCleaner;

    /**
     * The tag components contained within this tag list.
     *
     * @docs-private
     */
    @ContentChildren(KbqTag, {
        // Need to use `descendants: true`,
        // Ivy will no longer match indirect descendants if it's left as false.
        descendants: true
    })
    tags: QueryList<KbqTag>;

    /**
     * Whether the component is in an error state.
     *
     * @docs-private
     */
    errorState: boolean = false;

    /** The tag input to add more tags */
    private tagInput: KbqTagTextControl;

    /**
     * When a tag is destroyed, we store the index of the destroyed tag until the tags
     * query list notifies about the update. This is necessary because we cannot determine an
     * appropriate tag that should receive focus until the array of tags updated completely.
     */
    private lastDestroyedTagIndex: number | null = null;

    /** Subscription to focus changes in the tags. */
    private tagFocusSubscription: Subscription | null;

    /** Subscription to blur changes in the tags. */
    private tagBlurSubscription: Subscription | null;

    /** Subscription to remove changes in tags. */
    private tagRemoveSubscription: Subscription | null;

    /** Subscription to edit changes in tags. */
    private tagEditSubscription: Subscription | null;

    constructor(
        protected elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() private dir: Directionality,
        @Optional() public parentForm: NgForm,
        @Optional() public parentFormGroup: FormGroupDirective,
        @Optional() @Self() public ngControl: NgControl
    ) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }

        this.setupDropListInitialProperties();
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }

    ngAfterContentInit() {
        this.keyManager = new FocusKeyManager<KbqTag>(this.tags)
            .withVerticalOrientation()
            .withHorizontalOrientation(this.dir ? this.dir.value : 'ltr')
            .skipPredicate(({ disabled }) => disabled);

        if (this.dir) {
            this.dir.change
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((dir) => this.keyManager.withHorizontalOrientation(dir));
        }

        // Prevents the tag list from capturing focus and redirecting
        // it back to the first tag when the user tabs out.
        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this._tabIndex = -1;

            setTimeout(() => {
                this._tabIndex = this.userTabIndex || 0;
                this.changeDetectorRef.markForCheck();
            });
        });

        // When the list changes, re-subscribe
        this.tags.changes
            .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
            .subscribe((currentTags: QueryList<KbqTag> | null) => {
                this.resetTags();

                // Check to see if we need to update our tab index
                this.updateTabIndex();

                // Check to see if we have a destroyed tag and need to refocus
                this.updateFocusForDestroyedTags();

                // Defer setting the value in order to avoid the "Expression
                // has changed after it was checked" errors from Angular.
                Promise.resolve().then(() => {
                    this.stateChanges.next();

                    // do not call on initial
                    if (currentTags && this.emitOnTagChanges) {
                        this.propagateTagsChanges();
                    }
                });
            });
    }

    ngAfterViewInit(): void {
        this.setupFocusMonitor();
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.dropSubscriptions();
    }

    /** @docs-private */
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

    /** @docs-private */
    onTouched = () => {};

    /** @docs-private */
    onChange: (value: any) => void = () => {};

    /**
     * Associates an HTML input element with this tag list.
     *
     * @docs-private
     */
    registerInput(inputElement: KbqTagTextControl): void {
        this.tagInput = inputElement;

        // todo need rethink about it (#DS-3740)
        if (this.ngControl && inputElement.ngControl?.statusChanges) {
            inputElement.ngControl.statusChanges.subscribe(() =>
                this.ngControl.control!.setErrors(inputElement.ngControl!.errors)
            );
        }
    }

    /**
     * Implemented as part of ControlValueAccessor.
     */
    writeValue(value: any): void {
        this.value = value;
    }

    /**
     * Implemented as part of ControlValueAccessor.
     */
    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    /**
     * Implemented as part of ControlValueAccessor.
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Implemented as part of ControlValueAccessor.
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.stateChanges.next();
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    onContainerClick(): void {
        this.focus();
    }

    /**
     * Focuses the tag list. If there is a tag input, focuses that instead.
     */
    focus(): void {
        if (this.disabled) return;

        if (this.tagInput) {
            this.focusInput();
            this.stateChanges.next();

            return;
        }

        if (this.tags.length > 0) {
            this.keyManager.setFirstItemActive();
            this.stateChanges.next();

            return;
        }
    }

    /**
     * Focuses the tag input inside the tag list.
     *
     * @docs-private
     */
    focusInput() {
        if (this.tagInput) {
            this.tagInput.focus();
        }
    }

    /**
     * Pass events to the keyboard manager. Available here for tests.
     *
     * @docs-private
     */
    keydown(event: KeyboardEvent): void {
        const target = event.target as HTMLElement | null;

        if (this.disabled || isNull(target)) return;

        const shouldSelectAll = this.selectable && isSelectAll(event);

        if (this.isInputEmpty(target)) {
            if (
                event.keyCode === BACKSPACE ||
                event.keyCode === LEFT_ARROW ||
                (event.keyCode === TAB && event.shiftKey)
            ) {
                this.keyManager.setLastItemActive();
                event.preventDefault();

                return;
            }

            if (shouldSelectAll) {
                this.selectAll();
                this.keyManager.setLastItemActive();
                event.preventDefault();

                return;
            }
        } else if (this.isTagElement(target)) {
            if (event.keyCode === HOME) {
                this.keyManager.setFirstItemActive();
                event.preventDefault();
            } else if (event.keyCode === END) {
                this.keyManager.setLastItemActive();
                event.preventDefault();
            } else if (shouldSelectAll) {
                this.selectAll();
                this.keyManager.setLastItemActive();
                event.preventDefault();
            } else {
                this.keyManager.onKeydown(event);
            }

            this.stateChanges.next();
        }
    }

    /**
     * @docs-private
     *
     * @deprecated Unused. Will be removed in next major release.
     */
    setSelectionByValue(_value: any, _isUserInput: boolean = true): void {}

    /** When blurred, mark the field as touched when focus moved outside the tag list. */
    blur() {
        if (!this.hasFocusedTag()) {
            this.keyManager.setActiveItem(-1);
        }

        if (!this.disabled) {
            if (this.tagInput) {
                // If there's a tag input, we should check whether the focus moved to tag input.
                // If the focus is not moved to tag input, mark the field as touched. If the focus moved
                // to tag input, do nothing.
                // Timeout is needed to wait for the focus() event trigger on tag input.
                setTimeout(() => {
                    if (!this.focused) {
                        this.markAsTouched();
                        this.revalidate();
                    }
                });
            } else {
                // If there's no tag input, then mark the field as touched.
                this.markAsTouched();
                this.revalidate();
            }
        }
    }

    /** Mark the field as touched */
    markAsTouched() {
        this.onTouched();
        this.changeDetectorRef.markForCheck();
        this.stateChanges.next();
    }

    /**
     * Check the tab index as you should not be allowed to focus an empty list.
     *
     * @docs-private
     */
    protected updateTabIndex(): void {
        // If we have 0 tags, we should not allow keyboard focus
        this._tabIndex = this.userTabIndex || (this.tags.length === 0 ? -1 : 0);
    }

    /**
     * If the amount of tags changed, we need to update the
     * key manager state and focus the next closest tag.
     *
     * @docs-private
     */
    protected updateFocusForDestroyedTags() {
        if (this.lastDestroyedTagIndex != null) {
            if (this.tags.length) {
                const newTagIndex = Math.min(this.lastDestroyedTagIndex, this.tags.length - 1);

                this.keyManager.setActiveItem(newTagIndex);
            } else {
                this.focusInput();
            }
        }

        this.lastDestroyedTagIndex = null;
    }

    /**
     * Utility to ensure all indexes are valid.
     *
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of tags.
     */
    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.tags.length;
    }

    private isInputElement(element: HTMLElement): element is HTMLInputElement {
        return element.nodeName.toLowerCase() === 'input';
    }

    private isInputEmpty(element: HTMLElement): boolean {
        if (!this.isInputElement(element)) return false;

        return !element.value;
    }

    private isTagElement(element: HTMLElement): boolean {
        return element.classList.contains('kbq-tag');
    }

    private selectAll(): void {
        this.tags.forEach((tag) => tag.selectViaInteraction());
    }

    /**
     * Unselects all tags in the list.
     *
     * @docs-private
     */
    unselectAll(): void {
        this.tags.forEach((tag) => tag.setSelectedState(false));
    }

    /**
     * Removes all selected tags from the list.
     *
     * @docs-private
     */
    removeSelected(): void {
        this.selected.forEach((tag) => tag.remove());
    }

    private propagateTagsChanges(): void {
        const valueToEmit: any = this.tags.map((tag) => tag.value);

        this._value = valueToEmit;
        this.change.emit(new KbqTagListChange(this, valueToEmit));
        this.valueChange.emit(valueToEmit);
        this.onChange(valueToEmit);
        this.changeDetectorRef.markForCheck();
    }

    private resetTags(): void {
        this.dropSubscriptions();
        this.listenToTagsFocus();
        this.listenToTagsRemoved();
        this.listenToTagsEdit();
    }

    private dropSubscriptions() {
        if (this.tagFocusSubscription) {
            this.tagFocusSubscription.unsubscribe();
            this.tagFocusSubscription = null;
        }

        if (this.tagBlurSubscription) {
            this.tagBlurSubscription.unsubscribe();
            this.tagBlurSubscription = null;
        }

        if (this.tagRemoveSubscription) {
            this.tagRemoveSubscription.unsubscribe();
            this.tagRemoveSubscription = null;
        }

        if (this.tagEditSubscription) {
            this.tagEditSubscription.unsubscribe();
            this.tagEditSubscription = null;
        }
    }

    /** Listens to user-generated selection events on each tag. */
    private listenToTagsFocus(): void {
        this.tagFocusSubscription = this.tagFocusChanges.subscribe(({ tag, origin }) => {
            const tagIndex = this.tags.toArray().indexOf(tag);

            if (this.isValidIndex(tagIndex)) {
                this.keyManager.setFocusOrigin(origin);
                this.keyManager.updateActiveItem(tagIndex);
            }

            this.stateChanges.next();
        });

        this.tagBlurSubscription = this.tagBlurChanges.subscribe(() => {
            this.blur();

            this.stateChanges.next();
        });
    }

    private listenToTagsRemoved(): void {
        this.tagRemoveSubscription = this.tagRemoveChanges.subscribe((event) => {
            const tag = event.tag;
            const tagIndex = this.tags.toArray().indexOf(event.tag);

            // In case the tag that will be removed is currently focused, we temporarily store
            // the index in order to be able to determine an appropriate sibling tag that will
            // receive focus.
            if (this.isValidIndex(tagIndex) && tag.hasFocus) {
                this.lastDestroyedTagIndex = tagIndex;
            }
        });
    }

    private listenToTagsEdit(): void {
        this.tagEditSubscription = this.tagEditChanges
            .pipe(filter(({ type }) => type === 'submit'))
            .subscribe(() => this.propagateTagsChanges());
    }

    /** Checks whether any of the tags is focused. */
    private hasFocusedTag() {
        return this.tags.some((tag) => tag.hasFocus);
    }

    private syncTagsRemovableState(): void {
        this.tags?.forEach((tag) => (tag.removable = this.removable));
    }

    /** Revalidate control. */
    private revalidate() {
        if (this.ngControl?.control) {
            const control = this.ngControl.control;

            control.updateValueAndValidity({ emitEvent: false });
            (control.statusChanges as EventEmitter<string>).emit(control.status);
        }
    }

    private setupDropListInitialProperties(): void {
        this.syncDropListDisabledState();
        this.dropList.elementContainerSelector = '.kbq-tags-list__list-container';
        this.dropList.orientation = 'mixed';
        this.dropList.dropped
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ currentIndex, previousIndex, event, item }) => {
                const { tag }: KbqTagDragData = item.data;

                this.dropped.emit({ currentIndex, previousIndex, event, tag });
            });
    }

    private syncDropListDisabledState(): void {
        this.dropList.disabled = !this.draggable;
    }

    private setupFocusMonitor(): void {
        this.focusMonitor.monitor(this.elementRef, true).subscribe((origin) => {
            if (!origin) this.unselectAll();
        });
    }
}
