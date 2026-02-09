import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { BACKSPACE, DELETE, ENTER, ESCAPE, F2, SPACE } from '@angular/cdk/keycodes';
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
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Inject,
    Input,
    OnDestroy,
    Output,
    QueryList,
    signal,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFocusableOption } from '@koobiq/cdk/a11y';
import { hasModifierKey } from '@koobiq/cdk/keycodes';
import {
    isNull,
    KBQ_TITLE_TEXT_REF,
    KbqColorDirective,
    KbqComponentColors,
    KbqFieldSizingContent,
    KbqTitleTextRef
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { Subject } from 'rxjs';
import { KbqTagList } from './tag-list.component';

/**
 * Event object emitted by KbqTag.
 */
export type KbqTagEvent = {
    tag: KbqTag;
};

/**
 * Event object emitted by KbqTag when the tag is edited.
 */
export class KbqTagEditChange {
    constructor(
        public readonly tag: KbqTag,
        public readonly type: 'start' | 'submit' | 'cancel',
        public readonly reason: string
    ) {}
}

/** Event object emitted by KbqTag when selected or deselected. */
export class KbqTagSelectionChange {
    constructor(
        public source: KbqTag,
        public selected: boolean,
        public isUserInput = false
    ) {}
}

/**
 * Event object emitted when the KbqTag is focused.
 */
export type KbqTagFocusEvent = KbqTagEvent & {
    origin: FocusOrigin;
};

const TAG_ATTRIBUTE_NAMES = ['kbq-basic-tag'];

const getTagEditInputMissingError = (): Error => {
    return Error('Editable kbq-tag must contain a KbqTagEditInput.');
};

/**
 * Object passed to the drag data event when a tag is being dragged.
 *
 * @docs-private
 */
export type KbqTagDragData = KbqTagEvent;

/**
 * Dummy directive to add CSS class to tag avatar.
 * @docs-private
 */
@Directive({
    selector: 'kbq-tag-avatar, [kbqTagAvatar]',
    host: { class: 'kbq-tag-avatar' }
})
export class KbqTagAvatar {}

/**
 * Dummy directive to add CSS class to tag trailing icon.
 * @docs-private
 */
@Directive({
    selector: 'kbq-tag-trailing-icon, [kbqTagTrailingIcon]',
    host: { class: 'kbq-tag-trailing-icon' }
})
export class KbqTagTrailingIcon {}

/**
 * Directive to add submit behavior for the editable tag.
 */
@Directive({
    selector: '[kbqTagEditSubmit]',
    exportAs: 'kbqTagEditSubmit',
    host: {
        class: 'kbq-tag-edit-submit',
        '[attr.tabindex]': '-1',

        '(click)': 'tag.submitEditing("click")'
    }
})
export class KbqTagEditSubmit {
    /** @docs-private */
    protected readonly tag = inject(KbqTag);
}

/**
 * Directive to add input behavior for the editable tag.
 */
@Directive({
    selector: '[kbqTagEditInput]',
    exportAs: 'kbqTagEditInput',
    host: {
        class: 'kbq-tag-edit-input',

        '(keydown)': 'handleKeydown($event)',
        '(click)': 'handleClick($event)'
    },
    hostDirectives: [KbqFieldSizingContent]
})
export class KbqTagEditInput {
    private readonly tag = inject(KbqTag);

    /** @docs-private */
    protected handleClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    /** @docs-private */
    protected handleKeydown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case ESCAPE: {
                event.stopPropagation();
                this.tag.cancelEditing('escape');
                break;
            }
            case ENTER: {
                event.stopPropagation();
                this.tag.submitEditing('enter');
                break;
            }

            // We should prevent KbqTag from receiving these keydown events
            case BACKSPACE:
            case SPACE:
            case DELETE: {
                event.stopPropagation();
                break;
            }

            default:
        }
    }
}

@Component({
    selector: 'kbq-tag, [kbq-tag], kbq-basic-tag, [kbq-basic-tag]',
    template: `
        <div class="kbq-tag__wrapper">
            <ng-content select="[kbq-icon]:not([kbqTagRemove]):not([kbqTagEditSubmit])" />
            <span #kbqTitleText class="kbq-tag__text">
                @if (editing()) {
                    <ng-content select="[kbqTagEditInput]" />
                } @else {
                    <ng-content />
                }
            </span>
            @if (editing()) {
                <ng-content select="[kbqTagEditSubmit]" />
            } @else {
                @if (removable) {
                    <ng-content select="[kbqTagRemove]" />
                }
            }
        </div>
    `,
    styleUrls: ['./tag.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTag',
    hostDirectives: [CdkDrag],
    host: {
        class: 'kbq-tag',
        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled || null',
        '[class.kbq-selected]': 'selected',
        '[class.kbq-tag-with-avatar]': 'avatar',
        '[class.kbq-tag-with-icon]': 'contentChildren',
        '[class.kbq-tag-with-trailing-icon]': 'trailingIcon || removeIcon',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-tag_editable]': 'editable',
        '[class.kbq-tag_editing]': 'editing()',
        '[class.kbq-tag_removable]': 'removable',
        '[class.kbq-tag_selectable]': 'selectable',
        '[class.kbq-tag_draggable]': 'draggable',
        '(dblclick)': 'handleDblClick($event)',
        '(click)': 'handleClick($event)',
        '(keydown)': 'handleKeydown($event)'
    },
    providers: [{ provide: KBQ_TITLE_TEXT_REF, useExisting: KbqTag }]
})
export class KbqTag
    extends KbqColorDirective
    implements IFocusableOption, OnDestroy, KbqTitleTextRef, AfterContentInit, AfterViewInit
{
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly tagList = inject(KbqTagList, { optional: true });
    private readonly drag: CdkDrag<KbqTagDragData> = inject(CdkDrag, { host: true });
    private readonly destroyRef = inject(DestroyRef);

    /** @docs-private */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Emits when the tag is focused.
     *
     * @docs-private
     */
    readonly onFocus = new Subject<KbqTagFocusEvent>();

    /**
     * Emits when the tag is blurred.
     *
     * @docs-private
     */
    readonly onBlur = new Subject<KbqTagEvent>();

    /** @docs-private */
    readonly nativeElement = this.elementRef.nativeElement;

    /**
     * Whether the tag has focus.
     *
     * @docs-private
     */
    hasFocus: boolean = false;

    /** Whether the tag is editable. */
    @Input({ transform: booleanAttribute })
    get editable(): boolean {
        return this._editable ?? !!this.tagList?.editable;
    }

    set editable(value: boolean) {
        this._editable = value;
    }

    private _editable: boolean | undefined;

    /** Whether the tag edits can't be submitted. */
    @Input({ transform: booleanAttribute }) preventEditSubmit: boolean = false;

    @ContentChild(KbqTagEditInput, { read: ElementRef })
    private readonly editInputElementRef: ElementRef<HTMLInputElement>;

    /**
     * Emits event when the tag is edited.
     */
    @Output() readonly editChange = new EventEmitter<KbqTagEditChange>();

    /**
     * @docs-private
     */
    protected readonly editing = signal(false);

    /**
     * @docs-private
     */
    @ViewChild('kbqTitleText') readonly textElement: ElementRef<HTMLSpanElement>;

    @ContentChildren(KbqIcon) contentChildren: QueryList<KbqIcon>;

    /** The tag avatar */
    @ContentChild(KbqTagAvatar, { static: false }) avatar: KbqTagAvatar;

    /** The tag's trailing icon. */
    @ContentChild(KbqTagTrailingIcon, { static: false }) trailingIcon: KbqTagTrailingIcon;

    /** The tag's remove toggler. */
    @ContentChild(forwardRef(() => KbqTagRemove), { static: false }) removeIcon: KbqTagRemove;

    /** Emitted when the tag is selected or deselected. */
    @Output() readonly selectionChange: EventEmitter<KbqTagSelectionChange> = new EventEmitter<KbqTagSelectionChange>();

    /** Emitted when the tag is destroyed. */
    @Output() readonly destroyed: EventEmitter<KbqTagEvent> = new EventEmitter<KbqTagEvent>();

    /** Emitted when a tag is to be removed. */
    @Output() readonly removed: EventEmitter<KbqTagEvent> = new EventEmitter<KbqTagEvent>();

    /** Whether the tag is selected. */
    @Input({ transform: booleanAttribute })
    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        this.setSelectedState(value, { emitEvent: true });
    }

    private _selected: boolean = false;

    /** The value of the tag. Defaults to the content inside `<kbq-tag>` tags. */
    @Input()
    get value(): any {
        return this._value ?? this.elementRef.nativeElement.textContent?.trim();
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    /**
     * Whether the tag is selectable.
     */
    @Input({ transform: booleanAttribute })
    get selectable(): boolean {
        return this._selectable || !!this.tagList?.selectable;
    }

    set selectable(value: boolean) {
        this._selectable = value;
    }

    private _selectable: boolean = false;

    /**
     * Determines whether the tag is removable.
     */
    @Input({ transform: booleanAttribute })
    get removable(): boolean {
        return this._removable && (this.tagList?.removable ?? true);
    }

    set removable(value: boolean) {
        this._removable = value;
    }

    private _removable: boolean = true;

    @Input()
    get tabindex() {
        return this.disabled ? null : this._tabindex;
    }

    set tabindex(value: any) {
        this._tabindex = value;
    }

    private _tabindex = -1;

    /**
     * Whether the tag is disabled.
     */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled || (this.tagList?.disabled ?? false);
    }

    set disabled(value: boolean) {
        this._disabled = value;
        this.syncDragDisabledState();
    }

    private _disabled: boolean = false;

    /**
     * Whether the tag is draggable.
     *
     * @docs-private
     */
    protected get draggable(): boolean {
        return (this.tagList?.draggable ?? false) && !this.disabled;
    }

    constructor(public changeDetectorRef: ChangeDetectorRef) {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);

        this.addHostClassName();
        this.setupDragInitialProperties();
    }

    ngAfterContentInit() {
        this.addClassModificatorForIcons();
    }

    ngAfterViewInit(): void {
        this.setupFocusMonitor();
    }

    ngOnDestroy(): void {
        this.cancelEditing('destroy');
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.destroyed.emit({ tag: this });
    }

    /** @docs-private */
    addClassModificatorForIcons() {
        const icons = this.contentChildren.map((item) => item.elementRef.nativeElement);

        if (icons.length === 1) {
            const iconElement = icons[0];

            if (iconElement.classList.contains('kbq-tag-remove')) {
                iconElement.classList.add('kbq-icon_right');
                this.nativeElement.classList.add('kbq-right-icon');
            } else {
                iconElement.classList.add('kbq-icon_left');
                this.nativeElement.classList.add('kbq-left-icon');
            }
        } else if (icons.length > 1) {
            const firstIconElement = icons[0];
            const secondIconElement = icons[1];

            firstIconElement.classList.add('kbq-icon_left');
            secondIconElement.classList.add('kbq-icon_right');
        }
    }

    /** @docs-private */
    addHostClassName() {
        // Add class for the different tags
        for (const attr of TAG_ATTRIBUTE_NAMES) {
            if (
                this.elementRef.nativeElement.hasAttribute(attr) ||
                this.elementRef.nativeElement.tagName.toLowerCase() === attr
            ) {
                (this.elementRef.nativeElement as HTMLElement).classList.add(attr);

                return;
            }
        }

        (this.elementRef.nativeElement as HTMLElement).classList.add('kbq-standard-tag');
    }

    /**
     * Selects the tag.
     */
    select(): void {
        if (this.disabled || !this.selectable) return;

        this.setSelectedState(true, { emitEvent: true });
    }

    /**
     * Deselects the tag.
     */
    deselect(): void {
        if (this.disabled || !this.selectable) return;

        this.setSelectedState(false, { emitEvent: true });
    }

    /**
     * Selects the tag and emits event with isUserInput flag.
     *
     * @docs-private
     */
    selectViaInteraction(): void {
        if (this.disabled || !this.selectable) return;

        this.setSelectedState(true, { isUserInput: true, emitEvent: true });
    }

    /**
     * Toggles the current selected state of the tag.
     */
    toggleSelected(isUserInput: boolean = false): boolean {
        if (this.disabled || !this.selectable) return this.selected;

        this.setSelectedState(!this.selected, { isUserInput, emitEvent: true });

        return this.selected;
    }

    /** Focuses the tag. */
    focus(): void {
        if (this.disabled) return;

        this.elementRef.nativeElement.focus();
    }

    /**
     * Allows for programmatic removal of the tag. Called by the KbqTagList when the DELETE or
     * BACKSPACE keys are pressed.
     *
     * Informs any listeners of the removal request. Does not remove the tag from the DOM.
     */
    remove(): void {
        if (this.removable) {
            this.removed.emit({ tag: this });
        }
    }

    /** @docs-private */
    handleClick(event: MouseEvent): void {
        if (this.disabled || this.editing()) {
            event.preventDefault();

            return;
        }

        if (
            // We should toggle selection only if tag inside of a tag list.
            // Single tag can only be toggled on focus or blur.
            this.tagList &&
            this.selectable &&
            hasModifierKey(event, 'metaKey', 'ctrlKey', 'shiftKey')
        ) {
            this.toggleSelected(true);

            // We should stop event propagation to prevent the tag list from handling the click event.
            event.stopPropagation();

            return;
        }
    }

    /** @docs-private */
    handleKeydown(event: KeyboardEvent): void {
        if (this.disabled || this.editing()) return;

        switch (event.keyCode) {
            case DELETE:
            case BACKSPACE: {
                // If there is a tag list and it has selected tags, remove them, otherwise remove focused tag.
                this.tagList?.selected.length ? this.tagList.removeSelected() : this.remove();

                // Always prevent so page navigation does not occur
                event.preventDefault();
                break;
            }
            case SPACE: {
                this.toggleSelected(true);
                this.focusMonitor.focusVia(this.elementRef, 'keyboard');

                // Always prevent space from scrolling the page since the list has focus
                event.preventDefault();
                break;
            }
            case F2:
            case ENTER:
                this.startEditing(event.key);
                break;
            default:
        }
    }

    /** @docs-private */
    blur(): void {
        this.elementRef.nativeElement.blur();
    }

    /** @docs-private */
    protected handleDblClick(event: MouseEvent): void {
        if (this.disabled || !this.editable) return;

        event.stopPropagation();
        this.startEditing('dblclick');
    }

    private startEditing(reason: string): void {
        if (!this.editable || this.editing()) return;

        this.editing.set(true);
        this.editChange.emit({ tag: this, type: 'start', reason });

        setTimeout(() => {
            const input = this.editInputElementRef?.nativeElement;

            if (!input) throw getTagEditInputMissingError();

            this.focusMonitor.focusVia(this.elementRef.nativeElement, 'keyboard');
            input.select();
        });
    }

    /** @docs-private */
    cancelEditing(reason: string): void {
        if (!this.editing()) return;

        this.editing.set(false);
        this.editChange.emit({ tag: this, type: 'cancel', reason });

        this.textElement.nativeElement.scrollTo?.({ left: 0, behavior: 'instant' });
    }

    /** @docs-private */
    submitEditing(reason: string): void {
        if (!this.editing() || this.preventEditSubmit) return;

        this.editing.set(false);
        this.editChange.emit({ tag: this, type: 'submit', reason });

        this.textElement.nativeElement.scrollTo?.({ left: 0, behavior: 'instant' });
    }

    /**
     * Sets the selected state of the tag.
     *
     * @docs-private
     */
    setSelectedState(selected: boolean, options: Partial<{ isUserInput: boolean; emitEvent: boolean }> = {}): void {
        const { isUserInput = false, emitEvent = false } = options;

        if (selected !== this.selected) {
            this._selected = selected;

            if (emitEvent) {
                this.selectionChange.emit({
                    source: this,
                    isUserInput,
                    selected: this.selected
                });
            }

            this.changeDetectorRef.markForCheck();
        }
    }

    private setupDragInitialProperties(): void {
        this.syncDragDisabledState();

        this.drag.started.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.drag.data = { tag: this };
        });
    }

    private syncDragDisabledState(): void {
        this.drag.disabled = !this.draggable;
    }

    private setupFocusMonitor(): void {
        this.focusMonitor.monitor(this.elementRef, true).subscribe((origin) => {
            if (this.disabled) return;

            const hasFocus = !isNull(origin);

            if (hasFocus !== this.hasFocus) {
                this.hasFocus = hasFocus;

                if (this.hasFocus) {
                    this.onFocus.next({ tag: this, origin });
                    if (!this.tagList) this.select();
                } else {
                    this.onBlur.next({ tag: this });
                    this.cancelEditing('blur');
                    if (!this.tagList) this.deselect();
                }

                this.changeDetectorRef.markForCheck();
            }
        });
    }
}

/**
 *
 * Example:
 *
 *     `<kbq-tag>
 *       <kbq-icon kbqTagRemove>cancel</kbq-icon>
 *     </kbq-tag>`
 *
 * You *may* use a custom icon, but you may need to override the `kbq-tag-remove` positioning
 * styles to properly center the icon within the tag.
 */
@Directive({
    selector: '[kbqTagRemove]',
    host: {
        class: 'kbq-tag-remove kbq-tag-trailing-icon',
        '[attr.tabindex]': '-1',
        '(click)': 'handleClick($event)',
        '(focus)': 'focus($event)'
    }
})
export class KbqTagRemove {
    constructor(@Inject(forwardRef(() => KbqTag)) protected parentTag: KbqTag) {}

    /** @docs-private */
    focus(event: FocusEvent): void {
        event.stopPropagation();
    }

    /**
     * Calls the parent tag's public `remove()` method if applicable.
     *
     * @docs-private
     */
    handleClick(event: Event): void {
        if (this.parentTag.removable) {
            this.parentTag.hasFocus = true;

            this.parentTag.remove();
        }

        // We need to stop event propagation because otherwise the event will bubble up to the
        // form field and cause the `onContainerClick` method to be invoked. This method would then
        // reset the focused tag that has been focused after tag removal. Usually the parent
        // the parent click listener of the `KbqTag` would prevent propagation, but it can happen
        // that the tag is being removed before the event bubbles up.
        event.stopPropagation();
    }
}
