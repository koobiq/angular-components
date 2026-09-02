import { _IdGenerator } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    ContentChildren,
    contentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    numberAttribute,
    output,
    QueryList,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ActiveDescendantKeyManager,
    KBQ_OPTION_PARENT_COMPONENT,
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    kbqInjectNativeElement,
    KbqOptgroup,
    KbqOption,
    KbqPanelMaxWidth,
    KbqPanelWidth
} from '@koobiq/components/core';
import { KBQ_FORM_FIELD } from '@koobiq/components/form-field';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { delay, filter } from 'rxjs/operators';

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
    imports: [KbqScrollbarViewport],
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
        class: 'kbq-autocomplete',
        // Remove the empty TemplatePortal host from layout entirely — it would otherwise contribute an
        // inline box in normal flow, or a phantom item in a flex/grid container.
        style: 'display: none'
    },
    exportAs: 'kbqAutocomplete'
})
export class KbqAutocomplete implements AfterContentInit {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { host: true, optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly defaultOptions = inject<KbqAutocompleteDefaultOptions>(KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS);

    /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
    readonly id: string = inject(_IdGenerator).getId('kbq-autocomplete-');

    /**
     * Manages active item in option list based on key events.
     *
     * @docs-private
     */
    keyManager: ActiveDescendantKeyManager<KbqOption>;

    /**
     * Whether the autocomplete panel should be visible, depending on option length.
     *
     * @docs-private
     */
    readonly showPanel = signal(false);

    readonly template = viewChild.required(TemplateRef);

    readonly panel = viewChild.required<ElementRef>('panel');

    private readonly scrollbarViewport = viewChild(KbqScrollbarViewport);

    @ContentChildren(KbqOption, { descendants: true }) options: QueryList<KbqOption>;

    readonly optionGroups = contentChildren(KbqOptgroup);

    /** Function that maps an option's control value to its display value in the trigger. */
    readonly displayWith = input<((value: any) => string) | null>(null);

    /**
     * Specify the width of the autocomplete panel. If set to `auto`, the panel will match the width of
     * its host, but will never be narrower than `panelMinWidth`. Any other CSS sizing value is used as an
     * exact width, and `panelMinWidth` is not applied. When not set, the panel sizes to its content and is
     * at least as wide as its host.
     */
    readonly panelWidth = input<KbqPanelWidth | undefined>(undefined);

    /**
     * Minimum width of the panel in pixels.
     * When panelWidth is not set, the panel will be at least as wide as its host and no less than panelMinWidth.
     */
    readonly panelMinWidth = input<number, unknown>(KBQ_PANEL_DEFAULT_MIN_WIDTH, { transform: numberAttribute });

    /**
     * Maximum width of the panel in pixels. Caps how far the panel grows with its content — it never makes
     * the panel narrower than its host, and never clamps an explicit `panelWidth`.
     * When null, the `--kbq-panel-size-width-max` token applies.
     */
    readonly panelMaxWidth = input<KbqPanelMaxWidth, unknown>(null, { transform: numberAttribute });

    /** Event that is emitted whenever an option from the list is selected. */
    readonly optionSelected = output<KbqAutocompleteSelectedEvent>();

    /** Event that is emitted when the autocomplete panel is opened. */
    readonly opened = output<void>();

    /** Event that is emitted when the autocomplete panel is closed. */
    readonly closed = output<void>();

    /**
     * Classes set on the host `kbq-autocomplete` element. They are applied to the panel inside the
     * overlay container instead, to allow for easy styling.
     */
    readonly hostClass = input<string>('', { alias: 'class' });

    /**
     * Whether the first option should be highlighted when the autocomplete panel is opened.
     * Can be configured globally through the `KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS` token.
     */
    readonly autoActiveFirstOption = input(!!this.defaultOptions.autoActiveFirstOption, {
        transform: booleanAttribute
    });

    /** Whether the panel opens as soon as the trigger receives focus. */
    readonly openOnFocus = input(true, { transform: booleanAttribute });

    /**
     * Whether the trigger has attached the panel overlay. It is not the same thing as the panel being
     * visible — see `isOpen`.
     *
     * @docs-private
     */
    readonly attached = signal(false);

    /** Whether the panel is visible: attached by the trigger and holding at least one option. */
    readonly isOpen = computed(() => this.attached() && this.showPanel());

    /** Whether the trigger's form field currently holds keyboard focus. */
    private readonly keyboardFocused = signal(false);

    /** @docs-private */
    protected readonly classList = computed<Record<string, boolean>>(() => ({
        ...Object.fromEntries(
            this.hostClass()
                .split(' ')
                .map((className) => className.trim())
                .filter(Boolean)
                .map((className) => [className, true])
        ),
        'kbq-autocomplete_visible': this.showPanel(),
        'kbq-autocomplete_hidden': !this.showPanel(),
        'cdk-keyboard-focused': this.keyboardFocused()
    }));

    constructor() {
        // The host is `display: none` and only carries the template portal, so the classes written on it
        // belong to the panel inside the overlay. Move them off the host once they have been read.
        effect(() => {
            if (this.hostClass()) {
                this.nativeElement.className = '';
            }
        });

        outputToObservable(this.opened)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.scrollbarViewport()?.flashScrollIndicators());
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

    /** @docs-private */
    setScrollTop(scrollTop: number): void {
        const panel = this.panel();

        if (panel) {
            panel.nativeElement.scrollTop = scrollTop;
        }
    }

    /** @docs-private */
    getScrollTop(): number {
        const panel = this.panel();

        return panel ? panel.nativeElement.scrollTop : 0;
    }

    /** @docs-private */
    setVisibility(): void {
        this.showPanel.set(!!this.options.length);

        this.updateFocusClass();

        this.changeDetectorRef.markForCheck();
    }

    /** @docs-private */
    emitSelectEvent(option: KbqOption): void {
        const event = new KbqAutocompleteSelectedEvent(this, option);

        this.optionSelected.emit(event);
    }

    /** @docs-private */
    onKeydown(event: KeyboardEvent): any {
        this.keyManager.onKeydown(event);

        this.updateFocusClass();
    }

    private updateFocusClass(): void {
        this.keyboardFocused.set(this.parentFormField?.focusOrigin === 'keyboard');
    }
}
