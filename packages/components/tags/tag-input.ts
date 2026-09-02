import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    input,
    OnChanges,
    output,
    Provider
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import {
    COMMA,
    ENTER,
    hasModifierKey,
    KbqFieldSizingContent,
    kbqInjectAutofilled,
    SEMICOLON,
    SPACE,
    TAB
} from '@koobiq/components/core';
import { KbqTrim } from '@koobiq/components/form-field';
import { KbqTagList } from './tag-list.component';
import { KbqTagTextControl } from './tag-text-control';

const KBQ_TAG_INPUT_DEFAULT_SEPARATORS: KbqTagSeparator[] = [
    { symbol: /\r?\n/, key: 'Enter', keyCode: ENTER },
    { symbol: /\t/, key: 'Tab', keyCode: TAB },
    { symbol: / /, key: ' ', keyCode: SPACE },
    { symbol: /,/, key: ',', keyCode: COMMA },
    { symbol: /;/, key: ';', keyCode: SEMICOLON }
];

/** Represents an input event on a `kbqTagInput`. */
export interface KbqTagInputEvent {
    /** The native `<input>` element that the event is being fired for. */
    input: HTMLInputElement;

    /** The value of the input. */
    value: string;
}

/** Contexts a `KbqTagSeparator` can be active in. */
export type KbqTagSeparatorContext = 'input' | 'paste';

/** Defines a character or pattern that ends a tag, and the contexts in which it applies. */
export interface KbqTagSeparator {
    /** Regular expression used to match/split this separator in text. */
    symbol: RegExp;

    /**
     * `KeyboardEvent.key` that triggers this separator while typing.
     * Omit for separators with no single-keystroke equivalent (e.g. a run of whitespace) —
     * those are implicitly paste-only, since they can never match a `keydown`.
     */
    key?: string;

    /**
     * Numeric key code gating whether this separator is enabled, set via `kbqTagInputSeparatorKeyCodes`.
     * Omit together with `key` for separators that should always be active regardless of that input.
     */
    keyCode?: number;

    /**
     * Contexts this separator applies to.
     * @default ['input', 'paste']
     */
    appliesTo?: KbqTagSeparatorContext[];
}

/** Default options for the tags module that can be overridden. */
export interface KbqTagsDefaultOptions {
    /** The list of key codes that will trigger a tagEnd event. */
    separatorKeyCodes: number[];

    /** Custom separator definitions to use instead of the built-in defaults. */
    separators?: KbqTagSeparator[];

    /** Whether the tagEnd event will be emitted when text is pasted. */
    addOnPaste?: boolean;
}

const KBQ_TAGS_DEFAULT_OPTIONS_CONFIG: KbqTagsDefaultOptions = { separatorKeyCodes: [ENTER] };

/** Injection token to be used to override the default options. */
export const KBQ_TAGS_DEFAULT_OPTIONS = new InjectionToken<KbqTagsDefaultOptions>('kbq-tags-default-options', {
    providedIn: 'root',
    factory: () => KBQ_TAGS_DEFAULT_OPTIONS_CONFIG
});

/** Utility provider for `KBQ_TAGS_DEFAULT_OPTIONS`. */
export const kbqTagsDefaultOptionsProvider = (options: Partial<KbqTagsDefaultOptions>): Provider => ({
    provide: KBQ_TAGS_DEFAULT_OPTIONS,
    useValue: { ...KBQ_TAGS_DEFAULT_OPTIONS_CONFIG, ...options }
});

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
    private trimDirective = inject(KbqTrim, { optional: true, self: true });
    /**
     * The form control instance bound to the input, if any.
     *
     * @deprecated Unused. Bind `[formControl]`/`[ngModel]` to `<kbq-tag-list>` instead — it is the
     * single form control for the whole tag list. Will be removed in a future major release.
     * @docs-private
     */
    ngControl = inject(NgControl, { optional: true, self: true })!;
    /**
     * The autocomplete trigger attached to the input, if any.
     * @docs-private
     */
    autocompleteTrigger? = inject(KbqAutocompleteTrigger, { optional: true, self: true });
    /**
     * Whether the control is focused.
     * @docs-private
     */
    focused: boolean = false;

    /** Whether the control's value was filled in by the browser. */
    readonly autofilled = kbqInjectAutofilled();

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

    /**
     * The effective set of separators: entries gated by `keyCode` are included only when that
     * code is present in `separatorKeyCodes`; entries without a `keyCode` (no single-keystroke
     * equivalent, e.g. a run of whitespace) are always included.
     * @docs-private
     */
    get separators(): KbqTagSeparator[] {
        return this._separators.filter(
            (separator) => separator.keyCode === undefined || this._separatorKeyCodes.includes(separator.keyCode)
        );
    }

    private _separators: KbqTagSeparator[] = this.defaultOptions.separators || KBQ_TAG_INPUT_DEFAULT_SEPARATORS;

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

    constructor() {
        this.inputElement = this.elementRef.nativeElement as HTMLInputElement;
    }

    ngOnChanges(): void {
        this._tagList.stateChanges.next();
    }

    /** @docs-private */
    onKeydown(event: KeyboardEvent): void {
        const isSeparatorKey = this.matchesInputSeparator(event);

        if (!this.inputElement.value) {
            if (isSeparatorKey && event.keyCode !== TAB) {
                event.preventDefault();
            }

            this._tagList.keydown(event);
            event.stopPropagation();

            return;
        }

        if (isSeparatorKey) {
            if (
                event.keyCode === ENTER &&
                this.autocompleteTrigger?.panelOpen &&
                this.autocompleteTrigger?.activeOption
            ) {
                return;
            }

            this.emitTagEnd();

            event.preventDefault();
        }
    }

    /**
     * Checks to see if the blur should emit the (tagEnd) event.
     * @docs-private
     */
    blur(event: FocusEvent): void {
        this.focused = false;

        // Blur the tag list if it is not focused
        if (!this._tagList.focused) {
            this._tagList.blur();
        }

        if (this.addOnBlur && (this.autocompleteTrigger?.onInputBlur()(event) ?? true)) {
            this.emitTagEnd();
        }

        this._tagList.stateChanges.next();
    }

    /**
     * @deprecated Unused no-op. Validation belongs to the `<kbq-tag-list>` form control, which
     * revalidates itself whenever its value changes. Will be removed in a future major release.
     * @docs-private
     */
    triggerValidation(): void {}

    /**
     * Checks to see if the (tagEnd) event needs to be emitted.
     * @docs-private
     */
    emitTagEnd(): void {
        this.addTag(this.trimValue(this.inputElement.value));
    }

    /**
     * Whether the current input value duplicates an existing tag.
     * @docs-private
     */
    get hasDuplicates(): boolean {
        return this.isDuplicate(this.trimValue(this.inputElement.value));
    }

    /** @docs-private */
    onInput(): void {
        // Let tag list know whenever the value changes.
        this._tagList.stateChanges.next();
    }

    /** @docs-private */
    onPaste($event: ClipboardEvent): void {
        if (!$event.clipboardData) {
            return;
        }

        const data = $event.clipboardData.getData('text');

        if (!data || !this.addOnPaste()) {
            return;
        }

        const separatorsInString = this.getPasteSeparatorPatterns(data);

        // prettier-ignore
        const dividedString: string[] = separatorsInString.length > 0 ?
            [...data.split(new RegExp(`${separatorsInString.join('|')}`))] :
            [data];

        dividedString.forEach((item) => this.addTag(this.trimValue(item)));

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

    private getPasteSeparatorPatterns(value: string): string[] {
        return this.separators
            .filter(
                (separator) =>
                    (!separator.appliesTo || separator.appliesTo.includes('paste')) &&
                    value.search(separator.symbol) > -1
            )
            .map((separator) => separator.symbol.source);
    }

    /** Single path for adding a tag, shared by typed input, blur and paste. */
    private addTag(value: string): void {
        if (this.distinct() && this.isDuplicate(value)) return;

        // An empty value adds nothing, so latching the flag here would make the next
        // programmatic tags update look UI-initiated.
        if (value) {
            this._tagList?.notifyPendingTagChange();
        }

        this.tagEnd.emit({ input: this.inputElement, value });
    }

    private isDuplicate(value: string): boolean {
        return this._tagList.tags.some(({ value: tagValue }) => tagValue === value);
    }

    private trimValue(value) {
        return this.trimDirective ? this.trimDirective.trim(value) : value;
    }

    /** Checks whether a keydown event matches a separator that applies to typed input. */
    private matchesInputSeparator(event: KeyboardEvent): boolean {
        return this.separators.some(
            (separator) =>
                separator.key === event.key &&
                !hasModifierKey(event) &&
                (!separator.appliesTo || separator.appliesTo.includes('input'))
        );
    }
}
