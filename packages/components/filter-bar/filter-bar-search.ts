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
    selector: 'kbq-filter-bar-search, [kbq-filter-bar-search]',
    template: `
        <button
            [style.display]="isSearchActive ? 'none' : 'block'"
            [color]="'contrast'"
            [kbqStyle]="'transparent'"
            (click)="openSearch()"
            kbq-button
            kbqTooltip="Поиск"
        >
            <i kbq-icon="kbq-magnifying-glass_16"></i>
        </button>

        <kbq-form-field [style.display]="!isSearchActive ? 'none' : 'block'">
            <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>

            <input
                [formControl]="searchControl"
                (blur)="onBlur()"
                (keydown.escape)="onEscape()"
                autocomplete="off"
                kbqInput
                placeholder="Поиск"
            />

            <kbq-cleaner (click)="onClear()" />
        </kbq-form-field>
    `,
    styleUrl: 'filter-bar-search.scss',
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
        class: 'kbq-filter-bar-search'
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

        this.filterBar.onResetFilter.subscribe(this.onReset);
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
        this.isSearchActive = false;

        this.changeDetectorRef.markForCheck();
    };
}
