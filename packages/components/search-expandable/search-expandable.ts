import { AsyncPipe } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, ruRULocaleData } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter } from 'rxjs';

/** default configuration of search-expandable */
export const KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION = ruRULocaleData.searchExpandable;

/** Injection Token for providing configuration of search-expandable */
export const KBQ_SEARCH_EXPANDABLE_CONFIGURATION = new InjectionToken('KbqSearchExpandableConfiguration');

export const defaultValue = '';
export const defaultEmitValueTimeout = 200;

@Component({
    standalone: true,
    selector: 'kbq-search-expandable',
    templateUrl: './search-expandable.html',
    styleUrls: ['./search-expandable.scss'],
    host: {
        class: 'kbq-search-expandable',
        '[class.kbq-search-expandable_opened]': 'isOpened'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonModule,
        KbqIconModule,
        KbqInputModule,
        FormsModule,
        AsyncPipe,
        KbqToolTipModule,
        KbqFormFieldModule
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: KbqSearchExpandable,
            multi: true
        }
    ]
})
export class KbqSearchExpandable implements ControlValueAccessor {
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    readonly externalConfiguration = inject(KBQ_SEARCH_EXPANDABLE_CONFIGURATION, { optional: true });

    @ViewChild(KbqTooltipTrigger) private tooltip: KbqTooltipTrigger;

    configuration;

    value = new BehaviorSubject(defaultValue);

    @Input({ transform: booleanAttribute }) isOpened = false;
    @Input() isEmitValueByEnterEnabled = false;
    @Input() emitValueTimeout = defaultEmitValueTimeout;

    @Input()
    get placeholder(): string {
        return this._placeholder ?? this.localeData?.placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;
    }

    private _placeholder = this.localeData?.placeholder;

    @Output() readonly isOpenedChange = new EventEmitter<boolean>();

    /** localized data
     * @docs-private */
    get localeData() {
        return this.configuration?.search;
    }

    private lastEmittedValue = defaultValue;

    constructor() {
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

    onChange: (value: string) => void;

    onTouch: () => void = () => {};

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }

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
        this.configuration = this.externalConfiguration || this.localeService?.getParams('filterBar');

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
