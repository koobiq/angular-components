import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    contentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    numberAttribute,
    output,
    QueryList,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ActiveDescendantKeyManager,
    KBQ_OPTION_PARENT_COMPONENT,
    KbqOptgroup,
    KbqOption
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { delay, filter } from 'rxjs/operators';

/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let uniqueAutocompleteIdCounter = 0;

/** Footer that is rendered below the autocomplete options panel. */
@Directive({
    selector: '[kbqAutocompleteFooter], kbq-autocomplete-footer',
    host: { class: 'kbq-autocomplete-footer' }
})
export class KbqAutocompleteFooter {}

export class KbqAutocompleteSelectedEvent {
    constructor(
        public source: KbqAutocomplete,
        public option: KbqOption
    ) {}
}

/** Default `kbq-autocomplete` options that can be overridden. */
export interface KbqAutocompleteDefaultOptions {
    /** Whether the first option should be highlighted when an autocomplete panel is opened. */
    autoActiveFirstOption?: boolean;
}

/** Injection token to be used to override the default options for `kbq-autocomplete`. */
export const KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS = new InjectionToken<KbqAutocompleteDefaultOptions>(
    'kbq-autocomplete-default-options',
    {
        providedIn: 'root',
        factory: KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY
    }
);

export function KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY(): KbqAutocompleteDefaultOptions {
    return { autoActiveFirstOption: true };
}

@Component({
    selector: 'kbq-autocomplete',
    imports: [],
    templateUrl: 'autocomplete.html',
    styleUrls: ['autocomplete.scss', 'autocomplete-tokens.scss'],
    providers: [
        {
            provide: KBQ_OPTION_PARENT_COMPONENT,
            useExisting: KbqAutocomplete
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-autocomplete'
    },
    exportAs: 'kbqAutocomplete'
})
export class KbqAutocomplete implements AfterContentInit {
    private changeDetectorRef = inject(ChangeDetectorRef);
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly parentFormField = inject(KbqFormField, { host: true, optional: true })!;
    private readonly destroyRef = inject(DestroyRef);
    /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
    id: string = `kbq-autocomplete-${uniqueAutocompleteIdCounter++}`;

    /** Manages active item in option list based on key events. */
    keyManager: ActiveDescendantKeyManager<KbqOption>;

    /** Whether the autocomplete panel should be visible, depending on option length. */
    showPanel: boolean = false;

    readonly template = viewChild.required(TemplateRef);

    readonly panel = viewChild.required<ElementRef>('panel');

    @ContentChildren(KbqOption, { descendants: true }) options: QueryList<KbqOption>;

    readonly optionGroups = contentChildren(KbqOptgroup);

    /** Function that maps an option's control value to its display value in the trigger. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input() displayWith: ((value: any) => string) | null = null;

    /**
     * Specify the width of the autocomplete panel.  Can be any CSS sizing value, otherwise it will
     * match the width of its host.
     */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input() panelWidth: string | number;

    /**
     * Minimum width of the panel in pixels.
     * When panelWidth is not set, the panel will be at least as wide as its host and no less than panelMinWidth.
     */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: numberAttribute }) panelMinWidth: number = 200;

    /** Event that is emitted whenever an option from the list is selected. */
    readonly optionSelected = output<KbqAutocompleteSelectedEvent>();

    /** Event that is emitted when the autocomplete panel is opened. */
    readonly opened = output<void>();

    /** Event that is emitted when the autocomplete panel is closed. */
    readonly closed = output<void>();

    /**
     * Takes classes set on the host kbq-autocomplete element and applies them to the panel
     * inside the overlay container to allow for easy styling.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('class')
    get classList() {
        return this._classList;
    }

    set classList(value: string) {
        if (value && value.length) {
            const classList = { ...this._classList };

            value.split(' ').forEach((className) => (classList[className.trim()] = true));
            // Reassign a new object reference so the native `[class]` binding picks up the change.
            this._classList = classList;

            this.elementRef.nativeElement.className = '';
        }
    }

    private _classList: any = {};

    /**
     * Whether the first option should be highlighted when the autocomplete panel is opened.
     * Can be configured globally through the `KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS` token.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get autoActiveFirstOption(): boolean {
        return this._autoActiveFirstOption;
    }

    set autoActiveFirstOption(value: boolean) {
        this._autoActiveFirstOption = coerceBooleanProperty(value);
    }

    private _autoActiveFirstOption: boolean;

    get isOpen(): boolean {
        return this._isOpen && this.showPanel;
    }

    set isOpen(value: boolean) {
        this._isOpen = value;
    }

    private _isOpen: boolean = false;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get openOnFocus(): boolean {
        return this._openOnFocus;
    }

    set openOnFocus(value: boolean) {
        this._openOnFocus = value;
    }

    private _openOnFocus: boolean = true;

    constructor() {
        const defaults = inject<KbqAutocompleteDefaultOptions>(KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS);

        this._autoActiveFirstOption = !!defaults.autoActiveFirstOption;
    }

    ngAfterContentInit() {
        this.keyManager = new ActiveDescendantKeyManager<KbqOption>(this.options);
        this.setVisibility();

        this.parentFormField
            ?.control()
            .ngControl?.valueChanges?.pipe(
                delay(0),
                filter((value) => value === null || value === undefined || value === ''),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.options.filter(({ selected }) => selected).forEach((option) => option.deselect(false));
            });
    }

    setScrollTop(scrollTop: number): void {
        const panel = this.panel();

        if (panel) {
            panel.nativeElement.scrollTop = scrollTop;
        }
    }

    getScrollTop(): number {
        const panel = this.panel();

        return panel ? panel.nativeElement.scrollTop : 0;
    }

    setVisibility() {
        this.showPanel = !!this.options.length;
        this._classList = {
            ...this._classList,
            'kbq-autocomplete_visible': this.showPanel,
            'kbq-autocomplete_hidden': !this.showPanel
        };

        this.updateFocusClass();

        this.changeDetectorRef.markForCheck();
    }

    emitSelectEvent(option: KbqOption): void {
        const event = new KbqAutocompleteSelectedEvent(this, option);

        this.optionSelected.emit(event);
    }

    onKeydown(event: KeyboardEvent): any {
        this.keyManager.onKeydown(event);

        this.updateFocusClass();
    }

    private updateFocusClass() {
        this._classList = {
            ...this._classList,
            'cdk-keyboard-focused': this.parentFormField?.focusOrigin === 'keyboard'
        };
    }
}
