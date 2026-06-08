import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    input,
    OnChanges,
    output
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import { COMMA, ENTER, hasModifierKey, KbqFieldSizingContent, SEMICOLON, SPACE, TAB } from '@koobiq/components/core';
import { KbqTrim } from '@koobiq/components/form-field';
import { KBQ_TAGS_DEFAULT_OPTIONS, KbqTagsDefaultOptions } from './tag-default-options';
import { KbqTagList } from './tag-list.component';
import { KbqTagTextControl } from './tag-text-control';

const KBQ_TAG_INPUT_DEFAULT_SEPARATORS: { [key: number]: KbqTagSeparator } = {
    [ENTER]: { symbol: /\r?\n/, key: 'Enter' },
    [TAB]: { symbol: /\t/, key: 'Tab' },
    [SPACE]: { symbol: / /, key: ' ' },
    [COMMA]: { symbol: /,/, key: ',' },
    [SEMICOLON]: { symbol: /;/, key: ';' }
};

/** Represents an input event on a `kbqTagInput`. */
export interface KbqTagInputEvent {
    /** The native `<input>` element that the event is being fired for. */
    input: HTMLInputElement;

    /** The value of the input. */
    value: string;
}

export interface KbqTagSeparator {
    symbol: RegExp;
    key: string;
}
// Increasing integer for generating unique ids.
let nextUniqueId = 0;

/**
 * Directive that adds tag-specific behaviors to an input element inside `<kbq-form-field>`.
 * May be placed inside or outside of an `<kbq-tag-list>`.
 */
@Directive({
    selector: 'input[kbqTagInputFor]',
    host: {
        class: 'kbq-tag-input',
        '[id]': 'id',
        '[attr.disabled]': 'disabled || null',
        '[attr.placeholder]': 'placeholder || null',
        '(keydown)': 'onKeydown($event)',
        '(blur)': 'blur($event)',
        '(focus)': 'onFocus()',
        '(input)': 'onInput()',
        '(paste)': 'onPaste($event)'
    },
    hostDirectives: [KbqFieldSizingContent],
    exportAs: 'kbqTagInput, kbqTagInputFor'
})
export class KbqTagInput implements KbqTagTextControl, OnChanges {
    private elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private defaultOptions = inject<KbqTagsDefaultOptions>(KBQ_TAGS_DEFAULT_OPTIONS);
    private trimDirective = inject(KbqTrim, { optional: true, self: true })!;
    ngControl = inject(NgControl, { optional: true, self: true })!;
    autocompleteTrigger? = inject(KbqAutocompleteTrigger, { optional: true, self: true })!;
    /** Whether the control is focused. */
    focused: boolean = false;

    /**
     * The list of key codes that will trigger a tagEnd event.
     *
     * Defaults to `[ENTER]`.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTagInputSeparatorKeyCodes')
    set separatorKeyCodes(value: number[]) {
        this._separatorKeyCodes = value || [];
    }

    private _separatorKeyCodes: number[] = this.defaultOptions.separatorKeyCodes;

    /** @docs-private */
    get separators(): KbqTagSeparator[] {
        return this._separatorKeyCodes.reduce((acc: any, key) => {
            const separator = this.getSeparatorByKeyCode(key);

            return separator ? [...acc, separator] : acc;
        }, []);
    }

    private _separators = this.defaultOptions.separators || KBQ_TAG_INPUT_DEFAULT_SEPARATORS;

    /** Emitted when a tag is to be added. */
    readonly tagEnd = output<KbqTagInputEvent>({ alias: 'kbqTagInputTokenEnd' });

    /** A value indicating whether allow/prevent tags duplication  */
    readonly distinct = input<boolean>(false);

    /** The input's placeholder text. */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input() placeholder: string = '';

    /** Unique id for the input. */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input() id: string = `kbq-tag-list-input-${nextUniqueId++}`;

    /** Register input for tag list */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTagInputFor')
    set tagList(value: KbqTagList) {
        if (value) {
            this._tagList = value;
            this._tagList.registerInput(this);
        }
    }

    private _tagList: KbqTagList;

    /**
     * Whether or not the tagEnd event will be emitted when the input is blurred.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTagInputAddOnBlur')
    get addOnBlur(): boolean {
        return this._addOnBlur;
    }

    set addOnBlur(value: boolean) {
        this._addOnBlur = coerceBooleanProperty(value);
    }

    private _addOnBlur: boolean = true;

    /**
     * Whether the tagEnd event will be emitted when the text pasted.
     * @default true
     */
    readonly addOnPaste = input(this.defaultOptions.addOnPaste ?? true, {
        alias: 'kbqTagInputAddOnPaste',
        transform: booleanAttribute
    });

    /** Whether the input is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get disabled(): boolean {
        return this._disabled || (this._tagList && this._tagList.disabled);
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled: boolean = false;

    /** Whether the input is empty. */
    get empty(): boolean {
        return !this.inputElement.value;
    }

    /** The native input element to which this directive is attached. */
    private inputElement: HTMLInputElement;

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        this.inputElement = this.elementRef.nativeElement as HTMLInputElement;
    }

    ngOnChanges() {
        this._tagList.stateChanges.next();
    }

    /** @docs-private */
    onKeydown(event: KeyboardEvent) {
        const isSeparatorKey = this.isSeparatorKey(event);

        if (!this.inputElement.value) {
            if (isSeparatorKey) {
                event.preventDefault();
            }

            this._tagList.keydown(event);
            event.stopPropagation();

            return;
        }

        if (isSeparatorKey) {
            this.emitTagEnd();

            event.preventDefault();
        }
    }

    /** Checks to see if the blur should emit the (tagEnd) event. */
    blur(event: FocusEvent) {
        this.focused = false;

        // Blur the tag list if it is not focused
        if (!this._tagList.focused) {
            this.triggerValidation();

            this._tagList.blur();
        }

        if (this.addOnBlur && (this.autocompleteTrigger?.onInputBlur()(event) || true)) {
            this.emitTagEnd();
        }

        this._tagList.stateChanges.next();
    }

    triggerValidation() {
        if (!this.hasControl()) {
            return;
        }

        (this.ngControl.statusChanges as EventEmitter<string | null>).emit(this.ngControl.status);
    }

    /** Checks to see if the (tagEnd) event needs to be emitted. */
    emitTagEnd() {
        if (!this.hasControl() || (this.hasControl() && !this.ngControl.invalid)) {
            if (this.distinct() && this.hasDuplicates) return;

            this._tagList?.notifyPendingTagChange();
            this.tagEnd.emit({ input: this.inputElement, value: this.trimValue(this.inputElement.value) });
        }
    }

    get hasDuplicates(): boolean {
        return this._tagList.tags
            .map(({ value }) => value)
            .some((tagValue) => tagValue === this.trimValue(this.inputElement.value));
    }

    onInput() {
        // Let tag list know whenever the value changes.
        this._tagList.stateChanges.next();
    }

    onPaste($event: ClipboardEvent) {
        if (!$event.clipboardData) {
            return;
        }

        const data = $event.clipboardData.getData('text');

        if ((data && data.length === 0) || !this.addOnPaste()) {
            return;
        }

        const separatorsInString = this.getSeparatorsForString(data);

        // prettier-ignore
        const dividedString: string[] = separatorsInString.length > 0 ?
            [...data.split(new RegExp(`${separatorsInString.join('|')}`))] :
            [data];

        let items: string[] = dividedString.map((item) => this.trimValue(item));

        if (items.length === 0) {
            items.push(data);
        }

        if (this.distinct()) {
            const tagValues: string[] = this._tagList.tags.map(({ value }) => value);

            items = items.filter((item) => !tagValues.includes(item));
        }

        if (items.length) {
            this._tagList?.notifyPendingTagChange();
        }

        items.forEach((item) => this.tagEnd.emit({ input: this.inputElement, value: item }));

        $event.preventDefault();
        $event.stopPropagation();
    }

    /** @docs-private */
    onFocus(): void {
        this.focused = true;
        this._tagList.unselectAll();
        this._tagList.stateChanges.next();
    }

    /** Focuses the input. */
    focus(): void {
        this.inputElement.focus();
    }

    private getSeparatorsForString(value: string): string[] {
        return this.separators
            .filter((separator) => value.search(separator.symbol) > -1)
            .map((separator) => separator.symbol.source);
    }

    private trimValue(value) {
        return this.trimDirective ? this.trimDirective.trim(value) : value;
    }

    private getSeparatorByKeyCode(keyCode: number): KbqTagSeparator | null {
        const sep = this._separators[keyCode];

        if (sep) {
            return sep;
        }

        return null;
    }

    private hasControl(): boolean {
        return !!this.ngControl;
    }

    /** Checks whether a keycode is one of the configured separators. */
    private isSeparatorKey(event: KeyboardEvent) {
        return this.separators.some((separator) => separator.key === event.key && !hasModifierKey(event));
    }
}
