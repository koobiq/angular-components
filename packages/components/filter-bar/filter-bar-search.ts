import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

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
                (focusout)="closeSearch()"
                (keydown.enter)="onEnter()"
                autocomplete="off"
                kbqInput
                placeholder="Поиск"
            />

            <kbq-cleaner />
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
    @ViewChild(KbqInput) input: KbqInput;

    searchControl: UntypedFormControl = new UntypedFormControl();

    isSearchActive: boolean = false;

    @Output() readonly onSearch = new EventEmitter<string>();

    openSearch(): void {
        this.isSearchActive = true;

        setTimeout(() => this.input.focus());
    }

    closeSearch(): void {
        this.isSearchActive = false;
    }

    onEnter() {
        this.onSearch.emit(this.searchControl.value);
    }
}
