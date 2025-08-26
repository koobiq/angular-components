import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Output,
    QueryList,
    signal,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IFocusableOption } from '@koobiq/cdk/a11y';
import {
    isUndefined,
    KBQ_TITLE_TEXT_REF,
    KbqColorDirective,
    KbqComponentColors,
    KbqTitleTextRef
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface KbqTagEvent {
    tag: KbqTag;
}

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

const TAG_ATTRIBUTE_NAMES = ['kbq-basic-tag'];

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
    standalone: true,
    selector: '[kbqTagEditSubmit]',
    exportAs: 'kbqTagEditSubmit',
    host: {
        class: 'kbq-tag-edit-submit',
        '[attr.tabindex]': '-1',

        '(click)': 'handleClick($event)'
    }
})
export class KbqTagEditSubmit {
    private readonly tag = inject(KbqTag);

    /** @docs-private */
    protected handleClick(_event: Event): void {
        this.tag.submitEditing('click');
    }
}

/**
 * Directive to add input behavior for the editable tag.
 */
@Directive({
    standalone: true,
    selector: '[kbqTagEditInput]',
    exportAs: 'kbqTagEditInput',
    host: {
        class: 'kbq-tag-edit-input',

        '(keydown)': 'handleKeydown($event)'
    }
})
export class KbqTagEditInput {
    private readonly tag = inject(KbqTag);

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

            // prevent KbqTag from receiving these keydown events
            case BACKSPACE:
            case SPACE: {
                event.stopPropagation();
                break;
            }

            default:
        }
    }
}

@Component({
    selector: 'kbq-tag, [kbq-tag], kbq-basic-tag, [kbq-basic-tag]',
    exportAs: 'kbqTag',
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
                <ng-content select="[kbqTagRemove]" />
            }
        </div>
    `,
    styleUrls: ['./tag.scss'],
    host: {
        class: 'kbq-tag',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled || null',

        '[class.kbq-selected]': 'selected',
        '[class.kbq-focused]': 'hasFocus || editing()',
        '[class.kbq-tag-with-avatar]': 'avatar',
        '[class.kbq-tag-with-icon]': 'contentChildren',
        '[class.kbq-tag-with-trailing-icon]': 'trailingIcon || removeIcon',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-tag_editable]': 'editable',
        '[class.kbq-tag_editing]': 'editing()',

        '(dblclick)': 'handleDblClick($event)',

        '(mousedown)': 'handleMousedown($event)',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'focus()',
        '(blur)': 'blur()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: KBQ_TITLE_TEXT_REF, useExisting: KbqTag }]
})
export class KbqTag
    extends KbqColorDirective
    implements IFocusableOption, OnDestroy, KbqTitleTextRef, AfterContentInit, AfterViewInit
{
    private readonly focusMonitor = inject(FocusMonitor);

    /** Emits when the tag is focused. */
    readonly onFocus = new Subject<KbqTagEvent>();

    /** Emits when the tag is blurred. */
    readonly onBlur = new Subject<KbqTagEvent>();

    nativeElement: HTMLElement;

    /** Whether the tag has focus. */
    hasFocus: boolean = false;

    /** Whether the tag list is selectable */
    tagListSelectable: boolean = true;

    /**
     * Whether the tag list is editable.
     *
     * @docs-private
     */
    tagListEditable: boolean = false;

    /** Whether the tag is editable. */
    @Input({ transform: booleanAttribute })
    get editable(): boolean {
        return isUndefined(this._editable) ? this.tagListEditable : this._editable;
    }

    set editable(value: boolean) {
        this._editable = value;
    }

    private _editable: boolean | undefined = undefined;

    /** Whether the tag edits can't be submitted. */
    @Input({ transform: booleanAttribute }) preventEditSubmit: boolean = false;

    @ContentChild(KbqTagEditInput, { read: ElementRef }) private readonly editInputElementRef: ElementRef;

    /**
     * Emits event when the tag is edited.
     */
    @Output() readonly editChange = new EventEmitter<KbqTagEditChange>();

    /**
     * @docs-private
     */
    protected readonly editing = signal(false);

    @ViewChild('kbqTitleText') textElement: ElementRef;

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
    @Input()
    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        const coercedValue = coerceBooleanProperty(value);

        if (coercedValue !== this._selected) {
            this._selected = coercedValue;
            this.dispatchSelectionChange();
        }
    }

    private _selected: boolean = false;

    /** The value of the tag. Defaults to the content inside `<kbq-tag>` tags. */
    @Input()
    get value(): any {
        return this._value !== undefined ? this._value : this.elementRef.nativeElement.textContent;
    }

    set value(value: any) {
        this._value = value;
    }

    private _value: any;

    /**
     * Whether or not the tag is selectable. When a tag is not selectable,
     * changes to its selected state are always ignored. By default a tag is
     * selectable, and it becomes non-selectable if its parent tag list is
     * not selectable.
     */
    @Input()
    get selectable(): boolean {
        return this._selectable && this.tagListSelectable;
    }

    set selectable(value: boolean) {
        this._selectable = coerceBooleanProperty(value);
    }

    private _selectable: boolean = true;

    /**
     * Determines whether or not the tag displays the remove styling and emits (removed) events.
     */
    @Input()
    get removable(): boolean {
        return this._removable;
    }

    set removable(value: boolean) {
        this._removable = coerceBooleanProperty(value);
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

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    constructor(
        public elementRef: ElementRef,
        public changeDetectorRef: ChangeDetectorRef,
        private _ngZone: NgZone
    ) {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);

        this.addHostClassName();

        this.nativeElement = elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this.addClassModificatorForIcons();
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true).subscribe((focusOrigin) => {
            if (this.editing() && focusOrigin === null) this.cancelEditing('focusout');
        });
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.destroyed.emit({ tag: this });
    }

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

    select(): void {
        if (!this._selected) {
            this._selected = true;
            this.dispatchSelectionChange();
        }
    }

    deselect(): void {
        if (this._selected) {
            this._selected = false;
            this.dispatchSelectionChange();
        }
    }

    selectViaInteraction(): void {
        if (!this._selected) {
            this._selected = true;
            this.dispatchSelectionChange(true);
        }
    }

    toggleSelected(isUserInput: boolean = false): boolean {
        this._selected = !this.selected;
        this.dispatchSelectionChange(isUserInput);

        return this.selected;
    }

    /** Allows for programmatic focusing of the tag. */
    focus(): void {
        if (!this.selectable) {
            return;
        }

        if (!this.hasFocus) {
            this.elementRef.nativeElement.focus();

            this.onFocus.next({ tag: this });

            Promise.resolve().then(() => {
                this.hasFocus = true;
                this.changeDetectorRef.markForCheck();
            });
        }
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

    handleMousedown(event: Event) {
        if (this.disabled || !this.selectable) {
            event.preventDefault();
        } else {
            event.stopPropagation();
        }
    }

    /** @docs-private */
    handleKeydown(event: KeyboardEvent): void {
        if (this.disabled) {
            return;
        }

        switch (event.keyCode) {
            case DELETE:
            case BACKSPACE:
                // If we are removable, remove the focused tag
                this.remove();
                // Always prevent so page navigation does not occur
                event.preventDefault();
                break;
            case SPACE:
                // If we are selectable, toggle the focused tag
                if (this.selectable) {
                    this.toggleSelected(true);
                }

                // Always prevent space from scrolling the page since the list has focus
                event.preventDefault();
                break;
            case F2:
            case ENTER:
                this.startEditing(event.key);
                break;
            default:
        }
    }

    blur(): void {
        // When animations are enabled, Angular may end up removing the tag from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the tag list
        // that moves focus not the next item. To work around the issue, we defer marking the tag
        // as not focused until the next time the zone stabilizes.
        this._ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this._ngZone.run(() => {
                    this.hasFocus = false;
                    this.onBlur.next({ tag: this });
                });
            });
    }

    protected handleDblClick(event: MouseEvent): void {
        if (this.disabled || !this.editable) return;

        event.stopPropagation();
        this.startEditing('dblclick');
    }

    private startEditing(reason: string): void {
        if (this.editing()) return;

        this.editing.set(true);
        this.editChange.emit({ tag: this, type: 'start', reason });

        setTimeout(() => this.editInputElementRef?.nativeElement.focus());
    }

    /** @docs-private */
    cancelEditing(reason: string): void {
        this.editing.set(false);
        this.editChange.emit({ tag: this, type: 'cancel', reason });
    }

    /** @docs-private */
    submitEditing(reason: string): void {
        if (this.preventEditSubmit) return;

        this.editing.set(false);
        this.editChange.emit({ tag: this, type: 'submit', reason });
    }

    private dispatchSelectionChange(isUserInput = false) {
        this.selectionChange.emit({
            source: this,
            isUserInput,
            selected: this._selected
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

    focus($event): void {
        $event.stopPropagation();
    }

    /** Calls the parent tag's public `remove()` method if applicable. */
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
