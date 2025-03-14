import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
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
import { KbqFilterBar } from './filter-bar';

@Component({
    standalone: true,
    selector: 'kbq-filter-search, [kbq-filter-search]',
    template: `
        <button
            [class.kbq-filter_hidden]="isSearchActive"
            [color]="'contrast'"
            [kbqStyle]="'transparent'"
            (click)="openSearch()"
            kbq-button
            kbqTooltip="{{ filterBar.configuration.search.tooltip }}"
        >
            <i kbq-icon="kbq-magnifying-glass_16"></i>
        </button>

        <kbq-form-field [class.kbq-filter_hidden]="!isSearchActive">
            <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>

            <input
                [formControl]="searchControl"
                (blur)="onBlur()"
                (keydown.escape)="onEscape()"
                autocomplete="off"
                kbqInput
                placeholder="{{ filterBar.configuration.search.placeholder }}"
            />

            <kbq-cleaner (click)="onClear()" />
        </kbq-form-field>
    `,
    styleUrl: 'filter-search.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqDividerModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    host: {
        class: 'kbq-filter-search'
    }
})
export class KbqFilterBarSearch {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    @ViewChild(KbqInput) input: KbqInput;
    @ViewChild(KbqButton) button: KbqButton;
    @ViewChild(KbqTooltipTrigger) tooltip: KbqTooltipTrigger;

    searchControl: UntypedFormControl = new UntypedFormControl();

    isSearchActive: boolean = false;

    @Output() readonly onSearch = new EventEmitter<string>();

    constructor() {
        this.searchControl.valueChanges.subscribe(this.onSearch);

        this.filterBar.filterReset?.onResetFilter.pipe(takeUntilDestroyed()).subscribe(this.onReset);
    }

    openSearch(): void {
        this.isSearchActive = true;

        setTimeout(() => this.input.focus());
    }

    onBlur(): void {
        if (this.searchControl.value) return;

        this.onEscape();
    }

    onEscape(): void {
        this.isSearchActive = false;

        this.button.focusViaKeyboard();

        this.tooltip.hide();
    }

    onClear() {
        this.isSearchActive = false;

        setTimeout(() => {
            this.button.focus();

            this.tooltip.hide();
        });
    }

    onReset = () => {
        this.changeDetectorRef.markForCheck();
    };
}
