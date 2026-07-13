import { FocusMonitor } from '@angular/cdk/a11y';
import {
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
    QueryList,
    viewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, ruRULocaleData } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { map } from 'rxjs/operators';

/** default configuration of search-expandable */
export const KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION = ruRULocaleData.searchExpandable;

/** Injection Token for providing configuration of search-expandable */
export const KBQ_SEARCH_EXPANDABLE_CONFIGURATION = new InjectionToken('KbqSearchExpandableConfiguration');

export const defaultValue = '';
export const defaultEmitValueTimeout = 200;

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
    styleUrls: ['./search-expandable.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-search-expandable',
        '[class.kbq-search-expandable_opened]': 'isOpened'
    }
})
export class KbqSearchExpandable implements ControlValueAccessor, AfterViewInit, OnDestroy {
    /** @docs-private */
    protected readonly ngControl = inject(NgControl, { optional: true, self: true });
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly nativeElement: HTMLElement = inject(ElementRef).nativeElement;

    readonly externalConfiguration = inject(KBQ_SEARCH_EXPANDABLE_CONFIGURATION, { optional: true });

    @ViewChildren(KbqInput) private input: QueryList<KbqInput>;
    @ViewChildren(KbqButton) private button: QueryList<KbqButton>;
    private readonly tooltip = viewChild(KbqTooltipTrigger);

    configuration;

    /** Current value in input. */
    value = new BehaviorSubject(defaultValue);

    protected lastFocusOrigin: 'touch' | 'mouse' | 'keyboard' | 'program' | null = null;

    /** Suppress the automatic input focus once — set when the component auto-opens from a model value. */
    private suppressInputFocus = false;

    /** state of component. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) isOpened = false;
    /** Emit event by enter or not. Default is false */
    readonly isEmitValueByEnterEnabled = input(false);
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

    private _placeholder: string | null = this.localeData?.placeholder;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        if (this._disabled) {
            this.stopFocusMonitor();
        } else {
            this.runFocusMonitor();
        }
    }

    private _disabled: boolean = false;

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
    get localeData() {
        return this.configuration;
    }

    private lastEmittedValue = defaultValue;

    constructor() {
        if (!this.ngControl) {
            throw Error(`kbq-search-expandable must be used with the [formControl], [formControlName] or [(ngModel)].`);
        }

        this.ngControl.valueAccessor = this;

        this.ngControl.valueChanges?.pipe(takeUntilDestroyed()).subscribe((value) => this.value.next(value));

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }

        this.value
            .pipe(
                distinctUntilChanged(),
                filter(() => !this.isEmitValueByEnterEnabled()),
                debounceTime(this.emitValueTimeout()),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(this.emitValue);
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();

        this.button.changes
            .pipe(
                filter((queryList) => queryList.length),
                map((queryList) => queryList.first),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((button: KbqButton) => {
                const tooltip = this.tooltip();

                if (tooltip) {
                    tooltip.disabled = true;
                }

                this.focusMonitor.focusVia(button.elementRef.nativeElement, this.lastFocusOrigin);

                if (tooltip) {
                    tooltip.disabled = false;
                }
            });

        this.input.changes
            .pipe(
                filter((queryList) => queryList.length),
                map((queryList) => queryList.first),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((input: KbqInput) => {
                if (this.suppressInputFocus) {
                    this.suppressInputFocus = false;
                } else {
                    input.focus();
                }
            });

        // When the component starts opened (e.g. a seeded formControl value), the input is present on
        // first render and `input.changes` never fires to consume the flag — clear it so later
        // user-initiated opens focus the input as usual.
        if (this.input.length) {
            this.suppressInputFocus = false;
        }
    }

    ngOnDestroy() {
        this.stopFocusMonitor();
    }

    /** @docs-private */
    onChange: (value: string) => void;

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
        this.value.next(value || defaultValue);

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

    private setOpened(open: boolean): void {
        if (this.disabled || this.isOpened === open) return;

        this.isOpened = open;

        if (!open) {
            // Never let a stale suppress-flag survive a close.
            this.suppressInputFocus = false;
            this.value.next(defaultValue);
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

    private updateLocaleParams = () => {
        this.configuration = this.externalConfiguration || this.localeService?.getParams('searchExpandable');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION;
    }

    private emitValue = (value: string, forced = false): void => {
        if (value !== this.lastEmittedValue || forced) {
            this.onChange(value);
            this.lastEmittedValue = value;
        }
    };

    private runFocusMonitor() {
        this.focusMonitor.monitor(this.nativeElement, true).subscribe((origin) => (this.lastFocusOrigin = origin));
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.nativeElement);
    }
}
