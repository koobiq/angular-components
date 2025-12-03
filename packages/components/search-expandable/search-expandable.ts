import { FocusMonitor } from '@angular/cdk/a11y';
import { AsyncPipe } from '@angular/common';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    numberAttribute,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, ruRULocaleData } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
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
        AsyncPipe,
        KbqToolTipModule,
        KbqFormFieldModule
    ],
    templateUrl: './search-expandable.html',
    styleUrls: ['./search-expandable.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-search-expandable',
        '[class.kbq-search-expandable_opened]': 'isOpened'
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: KbqSearchExpandable,
            multi: true
        }
    ]
})
export class KbqSearchExpandable implements ControlValueAccessor, AfterViewInit {
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
    @ViewChild(KbqTooltipTrigger) private tooltip: KbqTooltipTrigger;

    configuration;

    /** Current value in input. */
    value = new BehaviorSubject(defaultValue);

    protected lastFocusOrigin: 'touch' | 'mouse' | 'keyboard' | 'program' | null;

    /** state of component. */
    @Input({ transform: booleanAttribute }) isOpened = false;
    /** Emit event by enter or not. Default is false */
    @Input() isEmitValueByEnterEnabled = false;
    /** Timeout in milliseconds for emit event. The default value is taken from defaultEmitValueTimeout */
    @Input({ transform: numberAttribute }) emitValueTimeout = defaultEmitValueTimeout;

    /** Placeholder for input when expanded */
    @Input()
    get placeholder(): string {
        return this._placeholder ?? this.localeData?.placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;
    }

    private _placeholder = this.localeData?.placeholder;

    /** Event emitted when the search has been toggled. */
    @Output() readonly isOpenedChange = new EventEmitter<boolean>();

    /** localized data
     * @docs-private */
    get localeData() {
        return this.configuration;
    }

    private lastEmittedValue = defaultValue;

    constructor() {
        this.focusMonitor
            .monitor(this.nativeElement, true)
            .pipe(takeUntilDestroyed())
            .subscribe((origin) => (this.lastFocusOrigin = origin));

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }

        this.value
            .pipe(
                distinctUntilChanged(),
                filter(() => !this.isEmitValueByEnterEnabled),
                debounceTime(this.emitValueTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(this.emitValue);
    }

    ngAfterViewInit(): void {
        this.button.changes
            .pipe(
                filter((queryList) => queryList.length),
                map((queryList) => queryList.first),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((button: KbqButton) => {
                this.tooltip.disabled = true;

                this.focusMonitor.focusVia(button.elementRef.nativeElement, this.lastFocusOrigin);

                this.tooltip.disabled = false;
            });

        this.input.changes
            .pipe(
                filter((queryList) => queryList.length),
                map((queryList) => queryList.first),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((input: KbqInput) => input.focus());
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
    }

    toggle(): void {
        this.isOpened = !this.isOpened;

        if (!this.isOpened) {
            this.value.next(defaultValue);

            if (this.isEmitValueByEnterEnabled) {
                this.emitValue(defaultValue, true);
            }
        }

        this.tooltip?.hide();

        this.isOpenedChange.emit(this.isOpened);
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
}
