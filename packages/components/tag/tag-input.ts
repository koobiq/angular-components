import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    Optional,
    Output,
    Renderer2,
    Self
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ENTER, TAB, SPACE, COMMA, SEMICOLON } from '@koobiq/cdk/keycodes';
import { KbqTrim } from '@koobiq/components/form-field';

import { KBQ_TAG_DEFAULT_OPTIONS, KbqTagDefaultOptions } from './tag-default-options';
import { KbqTagList } from './tag-list.component';
import { KbqTagTextControl } from './tag-text-control';
import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';


const KbqTagInputDefaultSeparators: { [key: number]: KbqTagSeparator } = {
    [ENTER]: { symbol: /\r?\n/, key: 'Enter' },
    [TAB]: { symbol: /\t/, key: 'Tab' },
    [SPACE]: { symbol: / /, key: ' ' },
    [COMMA]: { symbol: /,/, key: ',' },
    [SEMICOLON]: { symbol: /;/, key: ';' }
};

/** Represents an input event on a `kbqTagInput`. */
// tslint:disable-next-line: naming-convention
export interface KbqTagInputEvent {
    /** The native `<input>` element that the event is being fired for. */
    input: HTMLInputElement;

    /** The value of the input. */
    value: string;
}

export interface KbqTagSeparator {
    // tslint:disable-next-line:no-reserved-keywords
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
    exportAs: 'kbqTagInput, kbqTagInputFor',
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
    }
})
export class KbqTagInput implements KbqTagTextControl, OnChanges {
    /** Whether the control is focused. */
    focused: boolean = false;

    /**
     * The list of key codes that will trigger a tagEnd event.
     *
     * Defaults to `[ENTER]`.
     */
    @Input('kbqTagInputSeparatorKeyCodes')
    set separatorKeyCodes(value: number[]) {
        this._separatorKeyCodes = value || [];
    }

    private _separatorKeyCodes: number[] = this.defaultOptions.separatorKeyCodes;

    get separators(): KbqTagSeparator[] {
        return this._separatorKeyCodes
            .reduce(
                (acc: any, key) => {
                    const separator = this.getSeparatorByKeyCode(key);

                    return separator ? [...acc, separator] : acc;
                },
                []
            );
    }

    private _separators: { [key: number]: KbqTagSeparator };

    /** Emitted when a tag is to be added. */
    @Output('kbqTagInputTokenEnd') tagEnd: EventEmitter<KbqTagInputEvent> = new EventEmitter<KbqTagInputEvent>();

    /** A value indicating whether allow/prevent tags duplication  */
    @Input() distinct: boolean = false;

    /** The input's placeholder text. */
    @Input() placeholder: string = '';

    /** Unique id for the input. */
    @Input() id: string = `kbq-tag-list-input-${nextUniqueId++}`;

    /** Register input for tag list */
    @Input('kbqTagInputFor')
    set tagList(value: KbqTagList) {
        if (value) {
            this._tagList = value;
            this._tagList.registerInput(this);
        }
    }

    // tslint:disable-next-line: naming-convention
    private _tagList: KbqTagList;

    /**
     * Whether or not the tagEnd event will be emitted when the input is blurred.
     */
    @Input('kbqTagInputAddOnBlur')
    get addOnBlur(): boolean {
        return this._addOnBlur;
    }

    set addOnBlur(value: boolean) {
        this._addOnBlur = coerceBooleanProperty(value);
    }

    private _addOnBlur: boolean = true;

    /** Whether the input is disabled. */
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

    countOfSymbolsForUpdateWidth: number = 3;

    private oneSymbolWidth: number;

    /** The native input element to which this directive is attached. */
    private inputElement: HTMLInputElement;

    constructor(
        private elementRef: ElementRef<HTMLInputElement>,
        private renderer: Renderer2,
        @Inject(KBQ_TAG_DEFAULT_OPTIONS) private defaultOptions: KbqTagDefaultOptions,
        @Optional() @Self() private trimDirective: KbqTrim,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() @Self() public autocompleteTrigger?: KbqAutocompleteTrigger
    ) {
        // tslint:disable-next-line: no-unnecessary-type-assertion
        this.inputElement = this.elementRef.nativeElement as HTMLInputElement;

        this.setDefaultInputWidth();

        this._separators = this.defaultOptions.separators || KbqTagInputDefaultSeparators;
    }

    ngOnChanges() {
        this._tagList.stateChanges.next();
    }

    onKeydown(event: KeyboardEvent) {
        if (!this.inputElement.value) {
            this._tagList.keydown(event);
        }

        if (this.isSeparatorKey(event)) {
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

        // tslint:disable-next-line: no-unnecessary-type-assertion
        if (this.addOnBlur && (this.autocompleteTrigger?.onInputBlur(event) || true)) {
            this.emitTagEnd();
        }

        this._tagList.stateChanges.next();
    }

    triggerValidation() {
        if (!this.hasControl()) { return; }

        (this.ngControl.statusChanges as EventEmitter<string | null>).emit(this.ngControl.status);
    }

    /** Checks to see if the (tagEnd) event needs to be emitted. */
    emitTagEnd() {
        if (!this.hasControl() || (this.hasControl() && !this.ngControl.invalid)) {
            if (this.distinct && this.hasDuplicates) { return; }

            this.tagEnd.emit({ input: this.inputElement, value: this.trimValue(this.inputElement.value) });
            this.updateInputWidth();
        }
    }

    get hasDuplicates(): boolean {
        return this._tagList.tags.map(({ value }) => value)
            .some((tagValue) => tagValue === this.trimValue(this.inputElement.value));
    }

    onInput() {
        this.updateInputWidth();
        // Let tag list know whenever the value changes.
        this._tagList.stateChanges.next();
    }

    onPaste($event: ClipboardEvent) {
        if (!$event.clipboardData) { return; }

        const data = $event.clipboardData.getData('text');

        if (data && data.length === 0) { return; }

        const items: string[] = [];

        for (const separator of this.separators) {
            if (data.search(separator.symbol) > -1) {
                items.push(
                    ...data
                        .split(separator.symbol)
                        .map((item) => this.trimValue(item))
                );

                break;
            }
        }

        if (items.length === 0) {
            items.push(data);
        }

        const tagValues: string[] = this._tagList.tags.map(({ value }) => value);
        items.filter((item) => !tagValues.includes(item))
            .forEach((item) => this.tagEnd.emit({ input: this.inputElement, value: item }));

        this.updateInputWidth();

        $event.preventDefault();
        $event.stopPropagation();
    }

    updateInputWidth(): void {
        const length = this.inputElement.value.length;

        this.renderer.setStyle(this.inputElement, 'max-width', 0);
        this.oneSymbolWidth = this.inputElement.scrollWidth / length;
        this.renderer.setStyle(this.inputElement, 'max-width', '');

        if (length > this.countOfSymbolsForUpdateWidth) {
            this.renderer.setStyle(this.inputElement, 'width', `${length * this.oneSymbolWidth}px`);
        } else {
            this.setDefaultInputWidth();
        }
    }

    onFocus() {
        this.focused = true;
        this._tagList.stateChanges.next();
    }

    /** Focuses the input. */
    focus(): void {
        this.inputElement.focus();
    }

    private trimValue(value) {
        return this.trimDirective ? this.trimDirective.trim(value) : value;
    }

    private getSeparatorByKeyCode(keyCode: number): KbqTagSeparator | null {
        const sep = this._separators[keyCode];

        if (sep) { return sep; }

        return null;
    }

    private hasControl(): boolean {
        return !!this.ngControl;
    }

    private setDefaultInputWidth() {
        this.renderer.setStyle(this.inputElement, 'width', '30px');
    }

    /** Checks whether a keycode is one of the configured separators. */
    private isSeparatorKey(event: KeyboardEvent) {
        return this.separators
            .some((separator) => separator.key === event.key && !event.shiftKey);
    }
}
