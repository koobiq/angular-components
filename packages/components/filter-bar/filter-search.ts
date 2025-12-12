import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    input,
    numberAttribute,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { filter } from 'rxjs/operators';
import { KbqFilterBar } from './filter-bar';

export const defaultOnSearchTimeout = 0;

@Component({
    selector: 'kbq-filter-search, [kbq-filter-search]',
    imports: [
        KbqDividerModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <button
            kbqTooltip="{{ localeData.tooltip }}"
            kbq-button
            [class.kbq-filter_hidden]="isSearchActive"
            [color]="'contrast'"
            [kbqStyle]="'transparent'"
            (click)="openSearch()"
        >
            <i kbq-icon="kbq-magnifying-glass_16"></i>
        </button>

        <kbq-form-field [class.kbq-filter_hidden]="!isSearchActive">
            <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>

            <input
                placeholder="{{ localeData.placeholder }}"
                autocomplete="off"
                kbqInput
                [formControl]="searchControl"
                (blur)="onBlur()"
                (keydown.escape)="onEscape()"
                (keydown.enter)="onEnter()"
            />

            <kbq-cleaner (click)="onClear()" />
        </kbq-form-field>
    `,
    styleUrl: 'filter-search.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-filter-search'
    }
})
export class KbqFilterBarSearch implements AfterViewInit {
    /** KbqFilterBar instance */
    private readonly filterBar = inject(KbqFilterBar);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild(KbqInput) private input: KbqInput;
    @ViewChild(KbqButton) private button: KbqButton;
    @ViewChild(KbqTooltipTrigger) private tooltip: KbqTooltipTrigger;

    /** control for search */
    searchControl: UntypedFormControl = new UntypedFormControl();

    /** Whether the search active */
    isSearchActive: boolean = false;

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar.configuration.search;
    }

    /**
    /** Timeout in milliseconds for emit event. The default value is taken from defaultOnSearchTimeout
     * @default 0
     */
    readonly onSearchTimeout = input(defaultOnSearchTimeout, { transform: numberAttribute });

    /** Emit event by enter or not. Default is false */
    readonly emitValueByEnter = input(false, { transform: booleanAttribute });

    /** event that is generated whenever a user performs a search. */
    @Output() readonly onSearch = new EventEmitter<string>();

    ngAfterViewInit(): void {
        this.filterBar.filterReset?.onResetFilter.pipe(takeUntilDestroyed()).subscribe(this.onReset);

        this.searchControl.valueChanges
            .pipe(
                distinctUntilChanged(),
                filter(() => !this.emitValueByEnter()),
                debounceTime(this.onSearchTimeout()),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(this.onSearch);
    }

    openSearch(): void {
        this.isSearchActive = true;

        setTimeout(() => this.input.focus());
    }

    /** @docs-private */
    onBlur(): void {
        if (this.searchControl.value) return;

        this.onEscape();
    }

    /** @docs-private */
    onEscape(): void {
        this.isSearchActive = false;

        this.button.focusViaKeyboard();

        this.tooltip.hide();
    }

    /** @docs-private */
    onEnter(): void {
        if (this.emitValueByEnter()) {
            this.onSearch.emit(this.searchControl.value);
        }
    }

    /** @docs-private */
    onClear() {
        this.isSearchActive = false;

        setTimeout(() => {
            this.button.focus();

            this.tooltip.hide();
        });
    }

    /** @docs-private */
    onReset = () => {
        this.changeDetectorRef.markForCheck();
    };
}
