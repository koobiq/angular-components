import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewChecked,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    input,
    numberAttribute,
    OnDestroy,
    output,
    Provider,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroupDirective,
    FormsModule,
    NgControl,
    NgForm,
    ReactiveFormsModule
} from '@angular/forms';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import {
    ErrorStateMatcher,
    KbqDeepPartial,
    kbqInjectA11yLocaleConfiguration,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    KbqSearchExpandableLocaleConfiguration,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { BehaviorSubject, distinctUntilChanged, filter, Subject, Subscription, timer } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

/** default configuration of search-expandable */
export const KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION: KbqSearchExpandableLocaleConfiguration =
    ruRULocaleData.searchExpandable;

/** Injection Token for providing configuration of search-expandable */
export const KBQ_SEARCH_EXPANDABLE_CONFIGURATION = new InjectionToken<KbqSearchExpandableLocaleConfiguration>(
    'KbqSearchExpandableConfiguration',
    { factory: () => KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_SEARCH_EXPANDABLE_CONFIGURATION`. Only the strings you pass are overridden; the
 * rest keep following the active locale.
 */
export const kbqSearchExpandableLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqSearchExpandableLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('searchExpandable', configuration);

export const defaultValue = '';
export const defaultEmitValueTimeout = 200;

/**
 * Resolves the error state of the rendered field against the control the consumer bound, not against
 * the component's own validator-free control the input is wired to. Delegates to the ambient matcher so
 * a consumer-provided `ErrorStateMatcher` keeps deciding *when* the errors are shown.
 */
class BoundControlErrorStateMatcher implements ErrorStateMatcher {
    constructor(
        private readonly matcher: ErrorStateMatcher,
        private readonly boundControl: () => AbstractControl | null
    ) {}

    isErrorState(_control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return this.matcher.isErrorState(this.boundControl(), form);
    }
}

@Component({
    selector: 'kbq-search-expandable',
    imports: [
        KbqButtonModule,
        KbqIconModule,
        KbqInputModule,
        FormsModule,
        KbqToolTipModule,
        ReactiveFormsModule
    ],
    templateUrl: './search-expandable.html',
    styleUrls: ['./search-expandable.scss', './search-expandable-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-search-expandable',
        '[class.kbq-search-expandable_opened]': 'isOpened'
    }
})
export class KbqSearchExpandable implements ControlValueAccessor, AfterViewInit, AfterViewChecked, OnDestroy {
    /** @docs-private */
    protected readonly ngControl = inject(NgControl, { optional: true, self: true });
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly nativeElement: HTMLElement = inject(ElementRef).nativeElement;
    /**
     * Accessible names of the icon-only controls this component renders itself.
     * @docs-private
     */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /** Strings currently rendered by the component. */
    get configuration(): KbqSearchExpandableLocaleConfiguration {
        return this._configuration();
    }

    private readonly _configuration = kbqInjectLocaleConfiguration(
        'searchExpandable',
        KBQ_SEARCH_EXPANDABLE_CONFIGURATION
    );

    private readonly input = viewChild(KbqInput);
    private readonly button = viewChild(KbqButton);
    private readonly tooltip = viewChild(KbqTooltipTrigger);

    /** @docs-private */

    /**
     * Control backing the expanded input. Owning it — rather than binding the consumer's own control to
     * the input — keeps every write to the consumer's model going through the debounced pipeline below,
     * and keeps a programmatic write from being echoed back as a user edit.
     * @docs-private
     */
    protected readonly control = new FormControl<string>(defaultValue, { nonNullable: true });

    /**
     * Keeps the field's invalid state — and the `aria-invalid` derived from it — following the bound
     * control, which is the only one the consumer's validators run on.
     * @docs-private
     */
    protected readonly errorStateMatcher: ErrorStateMatcher = new BoundControlErrorStateMatcher(
        inject(ErrorStateMatcher),
        () => this.ngControl?.control ?? null
    );

    /** Icon of the collapsed button and of the expanded field's prefix. */
    protected readonly searchIconName = 'kbq-magnifying-glass_16';

    /** Current value in input. */
    value = new BehaviorSubject(defaultValue);

    protected lastFocusOrigin: 'touch' | 'mouse' | 'keyboard' | 'program' | null = null;

    /** Suppress the automatic input focus once — set when the component auto-opens from a model value. */
    private suppressInputFocus = false;

    /** Whether the expanded input was rendered on the previous change detection pass. */
    private inputRendered = false;
    /** Whether the collapsed button was rendered on the previous change detection pass. */
    private buttonRendered = false;

    /** Cancels a pending debounced emission once the value has been emitted (or reset) through another path. */
    private readonly cancelPendingEmit = new Subject<void>();

    private focusMonitorSubscription: Subscription | null = null;

    /** state of component. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) isOpened = false;
    /** Emit event by enter or not. Default is false */
    readonly isEmitValueByEnterEnabled = input(false, { transform: booleanAttribute });
    /** Timeout in milliseconds for emit event. The default value is taken from defaultEmitValueTimeout */
    readonly emitValueTimeout = input(defaultEmitValueTimeout, { transform: numberAttribute });

    /** Tooltip text for the search button. When set, overrides localeData.tooltip */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get tooltipText(): string {
        return this._tooltipText ?? this.localeData?.tooltip;
    }

    set tooltipText(value: string | null) {
        this._tooltipText = value;
    }

    private _tooltipText: string | null;

    /** Placeholder for input when expanded */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get placeholder(): string {
        return this._placeholder ?? this.localeData?.placeholder;
    }

    set placeholder(value: string | null) {
        this._placeholder = value;
    }

    private _placeholder: string | null = null;

    /** Whether the component is disabled. Also set by the bound control through `setDisabledState`. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        // `emitEvent: false`: `disable()`/`enable()` re-emit the current value, which would restart the
        // debounce and emit a value the user never typed.
        if (this._disabled) {
            this.control.disable({ emitEvent: false });
            this.stopFocusMonitor();
        } else {
            this.control.enable({ emitEvent: false });
            this.runFocusMonitor();
        }
    }

    private _disabled: boolean = false;

    /** Tab index of the collapsed button and of the expanded input. Always `-1` while disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    /** Event emitted when the search has been toggled. */
    readonly isOpenedChange = output<boolean>();

    /** localized data
     * @docs-private */
    get localeData(): KbqSearchExpandableLocaleConfiguration {
        return this.configuration;
    }

    private lastEmittedValue = defaultValue;

    constructor() {
        if (!this.ngControl) {
            throw Error(`kbq-search-expandable must be used with the [formControl], [formControlName] or [(ngModel)].`);
        }

        this.ngControl.valueAccessor = this;

        // `value` predates the internal control and stays part of the public API: writes into it must
        // still reach the field, and reads must still observe the current value. Both directions are
        // guarded on the current value, so the pair cannot loop.
        this.value.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe((value) => {
            if (this.control.value !== value) {
                this.control.setValue(value);
            }
        });

        this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.syncValueSubject(value));

        this.control.valueChanges
            .pipe(
                filter(() => !this.isEmitValueByEnterEnabled()),
                // No `distinctUntilChanged()` here: it remembers what the *field* last held, which a
                // programmatic write (`emitEvent: false`) and a close silently invalidate — retyping the
                // value the model was just reset from would then be swallowed forever. `emitValue` guards
                // on the last value actually handed to the consumer, which every path keeps in sync.
                //
                // `switchMap` over a `timer` rather than `debounceTime`: the timeout is read per value, so
                // `[emitValueTimeout]` keeps working after Angular has set the inputs, and `takeUntil` lets
                // an explicit emission (Enter, close) drop a pending one that would otherwise land
                // afterwards and overwrite the value that was just emitted.
                switchMap((value) =>
                    timer(this.emitValueTimeout()).pipe(
                        map(() => value),
                        takeUntil(this.cancelPendingEmit)
                    )
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((value) => this.emitValue(value));
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();

        // The first render is a page load rather than an expand or a collapse, so it only seeds what
        // the focus handoffs below compare against.
        this.inputRendered = !!this.input();
        this.buttonRendered = !!this.button();
        // When the component starts opened (e.g. a seeded formControl value), the input is present on
        // first render and no expand follows to consume the flag — clear it so later user-initiated
        // opens focus the input as usual.
        this.suppressInputFocus = false;
    }

    /**
     * Focus handoffs: the input takes focus when the field expands, the collapsed button takes it back
     * when the field closes.
     *
     * This runs from `ngAfterViewChecked` rather than from an `effect()` on the queries, because view
     * effects are flushed *before* view queries are refreshed within a change detection pass — an
     * effect would always move focus one pass late.
     * @docs-private
     */
    ngAfterViewChecked(): void {
        const inputControl = this.input();
        const toggleButton = this.button();
        const inputWasRendered = this.inputRendered;
        const buttonWasRendered = this.buttonRendered;

        this.inputRendered = !!inputControl;
        this.buttonRendered = !!toggleButton;

        if (toggleButton && !buttonWasRendered) {
            this.restoreFocusToButton(toggleButton);
        }

        if (inputControl && !inputWasRendered) {
            if (this.suppressInputFocus) {
                this.suppressInputFocus = false;
            } else {
                inputControl.focus();
            }
        }
    }

    ngOnDestroy() {
        this.stopFocusMonitor();
    }

    /** @docs-private */
    onChange: (value: string) => void = () => {};

    /** @docs-private */
    onTouch: () => void = () => {};

    /** Implemented as part of ControlValueAccessor. */
    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    /** Implemented as part of ControlValueAccessor. */
    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }

    /** Implemented as part of ControlValueAccessor. */
    writeValue(value: string): void {
        const nextValue = value || defaultValue;

        // The model supersedes whatever the user was typing: without this, an emission scheduled by the
        // keystrokes that preceded the write lands afterwards and puts the replaced query back.
        this.cancelPendingEmit.next();
        // The consumer's model is the source of truth on this path: recording it keeps `emitValue` from
        // re-emitting a value the model already holds, and lets it emit a value the user retypes after
        // the model was changed from the outside.
        this.lastEmittedValue = nextValue;
        // `emitEvent: false` keeps a programmatic write out of the debounced pipeline — feeding it back
        // through `onChange` would mark the consumer's control dirty and double-fire its `valueChanges`.
        this.control.setValue(nextValue, { emitEvent: false });
        this.syncValueSubject(nextValue);

        // Expand automatically when the model already holds a value, without stealing focus —
        // unless focus is already inside the component (e.g. on the collapsed toggle button
        // that's about to be removed from the DOM), in which case let it move to the input.
        if (value && !this.isOpened && !this.disabled) {
            this.suppressInputFocus = this.lastFocusOrigin === null;
            this.setOpened(true);
        }
    }

    /** Implemented as part of ControlValueAccessor. */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    toggle(): void {
        if (this.disabled) return;

        this.tooltip()?.hide();

        this.setOpened(!this.isOpened);
    }

    /**
     * Emits the typed value straight away when `isEmitValueByEnterEnabled` is set — the only path that
     * emits in that mode, since the debounced pipeline is filtered out.
     * @docs-private
     */
    protected onEnter(event: Event): void {
        if (!this.isEmitValueByEnterEnabled()) return;

        // Angular calls `preventDefault()` only for a handler that returns literal `false`, so without this
        // an Enter inside a native `<form>` would submit it on top of the emission it has just made.
        event.preventDefault();

        this.cancelPendingEmit.next();
        this.emitValue(this.control.value);
    }

    private setOpened(open: boolean): void {
        if (this.disabled || this.isOpened === open) return;

        this.isOpened = open;

        if (!open) {
            // Never let a stale suppress-flag survive a close.
            this.suppressInputFocus = false;
            // An emission scheduled by the keystrokes that preceded the close would put the discarded
            // query back into the bound control right after the reset.
            this.cancelPendingEmit.next();
            // `emitEvent: false`: the reset reaches the consumer through the forced emit below, so
            // routing it through the debounce as well would only schedule a redundant no-op emission.
            this.control.setValue(defaultValue, { emitEvent: false });
            this.syncValueSubject(defaultValue);
            // Force the emit — closing must always synchronize the bound control to the reset
            // value, rather than relying on the debounce to eventually settle (it can be raced
            // by a value pushed just before close, silently leaving the control at a stale value).
            this.emitValue(defaultValue, true);
        }

        this.isOpenedChange.emit(this.isOpened);

        // Ensure the OnPush view re-renders for callers that mutate isOpened from outside this
        // component's own template (e.g. a parent-owned button), whose click marks the parent —
        // not this component — dirty.
        this.changeDetectorRef.markForCheck();
    }

    /** Moves focus back onto the collapsed button, keeping its tooltip from opening on the way. */
    private restoreFocusToButton(button: KbqButton): void {
        const tooltip = this.tooltip();

        if (tooltip) {
            tooltip.disabled = true;
        }

        this.focusMonitor.focusVia(button.elementRef.nativeElement, this.lastFocusOrigin);

        if (tooltip) {
            tooltip.disabled = false;
        }
    }

    private syncValueSubject(value: string): void {
        if (this.value.value !== value) {
            this.value.next(value);
        }
    }

    private emitValue = (value: string, forced = false): void => {
        if (value !== this.lastEmittedValue || forced) {
            this.onChange(value);
            this.lastEmittedValue = value;
        }
    };

    private runFocusMonitor() {
        // `FocusMonitor.monitor()` hands back the same subject for an already-monitored element, so a
        // second subscription would double every notification; a disabled component is not monitored.
        if (this.disabled || this.focusMonitorSubscription) return;

        this.focusMonitorSubscription = this.focusMonitor
            .monitor(this.nativeElement, true)
            .subscribe((origin) => (this.lastFocusOrigin = origin));
    }

    private stopFocusMonitor() {
        this.focusMonitorSubscription?.unsubscribe();
        this.focusMonitorSubscription = null;

        this.focusMonitor.stopMonitoring(this.nativeElement);
    }
}
