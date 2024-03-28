import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ActiveDescendantKeyManager } from '@koobiq/cdk/a11y';
import { KBQ_OPTION_PARENT_COMPONENT, KbqOptgroup, KbqOption } from '@koobiq/components/core';


/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let uniqueAutocompleteIdCounter = 0;

export class KbqAutocompleteSelectedEvent {
    constructor(public source: KbqAutocomplete, public option: KbqOption) {}
}

/** Default `kbq-autocomplete` options that can be overridden. */
export interface KbqAutocompleteDefaultOptions {
    /** Whether the first option should be highlighted when an autocomplete panel is opened. */
    autoActiveFirstOption?: boolean;
}

/** Injection token to be used to override the default options for `kbq-autocomplete`. */
export const KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS =
    new InjectionToken<KbqAutocompleteDefaultOptions>('kbq-autocomplete-default-options', {
        providedIn: 'root',
        factory: KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY
    });

export function KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY(): KbqAutocompleteDefaultOptions {
    return { autoActiveFirstOption: true };
}

@Component({
    selector: 'kbq-autocomplete',
    exportAs: 'kbqAutocomplete',
    templateUrl: 'autocomplete.html',
    styleUrls: ['autocomplete.scss'],
    host: {
        class: 'kbq-autocomplete'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqAutocomplete
    }]
})
export class KbqAutocomplete implements AfterContentInit {
    /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
    id: string = `kbq-autocomplete-${uniqueAutocompleteIdCounter++}`;

    /** Manages active item in option list based on key events. */
    keyManager: ActiveDescendantKeyManager<KbqOption>;

    /** Whether the autocomplete panel should be visible, depending on option length. */
    showPanel: boolean = false;

    @ViewChild(TemplateRef, {static: true}) template: TemplateRef<any>;

    @ViewChild('panel', {static: false}) panel: ElementRef;

    @ContentChildren(KbqOption, { descendants: true }) options: QueryList<KbqOption>;

    @ContentChildren(KbqOptgroup) optionGroups: QueryList<KbqOptgroup>;

    /** Function that maps an option's control value to its display value in the trigger. */
    @Input() displayWith: ((value: any) => string) | null = null;

    /**
     * Specify the width of the autocomplete panel.  Can be any CSS sizing value, otherwise it will
     * match the width of its host.
     */
    @Input() panelWidth: string | number;

    /** Event that is emitted whenever an option from the list is selected. */
    @Output() readonly optionSelected: EventEmitter<KbqAutocompleteSelectedEvent> =
        new EventEmitter<KbqAutocompleteSelectedEvent>();

    /** Event that is emitted when the autocomplete panel is opened. */
    @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();

    /** Event that is emitted when the autocomplete panel is closed. */
    @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Takes classes set on the host kbq-autocomplete element and applies them to the panel
     * inside the overlay container to allow for easy styling.
     */
    @Input('class')
    get classList() {
        return this._classList;
    }

    set classList(value: string) {
        if (value && value.length) {
            value.split(' ')
                .forEach((className) => this._classList[className.trim()] = true);

            this.elementRef.nativeElement.className = '';
        }
    }

    private _classList: any = {};

    /**
     * Whether the first option should be highlighted when the autocomplete panel is opened.
     * Can be configured globally through the `KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS` token.
     */
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

    @Input()
    get openOnFocus(): boolean {
        return this._openOnFocus;
    }

    set openOnFocus(value: boolean) {
        this._openOnFocus = value;
    }

    private _openOnFocus: boolean = true;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private elementRef: ElementRef<HTMLElement>,
        @Inject(KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS) defaults: KbqAutocompleteDefaultOptions
    ) {
        this._autoActiveFirstOption = !!defaults.autoActiveFirstOption;
    }

    ngAfterContentInit() {
        this.keyManager = new ActiveDescendantKeyManager<KbqOption>(this.options);
        this.setVisibility();
    }

    setScrollTop(scrollTop: number): void {
        if (this.panel) {
            this.panel.nativeElement.scrollTop = scrollTop;
        }
    }

    getScrollTop(): number {
        return this.panel ? this.panel.nativeElement.scrollTop : 0;
    }

    setVisibility() {
        this.showPanel = !!this.options.length;
        this._classList['kbq-autocomplete_visible'] = this.showPanel;
        this._classList['kbq-autocomplete_hidden'] = !this.showPanel;

        this.changeDetectorRef.markForCheck();
    }

    emitSelectEvent(option: KbqOption): void {
        const event = new KbqAutocompleteSelectedEvent(this, option);

        this.optionSelected.emit(event);
    }

    onKeydown(event: KeyboardEvent): any {
        this.keyManager.onKeydown(event);
    }
}

