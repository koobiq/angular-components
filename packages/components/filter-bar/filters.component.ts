import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilter } from './filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-filters',
    template: `
        <button
            [ngClass]="{ 'kbq-button_changed-filter': activeFilter!.changed || activeFilter!.unsaved }"
            [color]="colors.ContrastFade"
            [kbqStyle]="styles.Outline"
            [kbqDropdownTriggerFor]="savedFilters"
            kbq-button
        >
            @if (!activeFilter) {
                <ng-content />
            } @else {
                {{ activeFilter.name }}
            }
        </button>

        @if (activeFilter!.unsaved) {
            <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" kbq-button>
                <i kbq-icon="kbq-floppy-disk_16" kbqPrefix></i>
            </button>
        }

        @if (activeFilter!.changed) {
            <button
                [ngClass]="{ 'kbq-button_changed-saved-filter': !activeFilter!.unsaved }"
                [color]="colors.ContrastFade"
                [kbqStyle]="styles.Outline"
                [kbqDropdownTriggerFor]="filterActions"
                kbq-button
            >
                <i kbq-icon="kbq-ellipsis-vertical_16" kbqPrefix></i>
            </button>
        }

        <kbq-dropdown #savedFilters="kbqDropdown">
            <kbq-form-field kbqFormFieldWithoutBorders>
                <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>

                <input [value]="value" kbqInput placeholder="Placeholder" />

                <kbq-cleaner />
            </kbq-form-field>

            <kbq-divider />

            @for (filter of filterBar.filters; track filter) {
                <button (click)="onSelectFilter(filter)" kbq-dropdown-item>{{ filter.name }}</button>
            }

            <kbq-divider />

            <button [disabled]="!activeFilter?.changed" kbq-dropdown-item>Disabled</button>
        </kbq-dropdown>

        <kbq-dropdown #filterActions="kbqDropdown">
            <button (click)="onSave()" (keydown.enter)="onSave()" kbq-dropdown-item>
                <i kbq-icon="kbq-floppy-disk_16"></i>
                Сохранить изменения
            </button>
            <button (click)="onSaveAsNew()" (keydown.enter)="onSaveAsNew()" kbq-dropdown-item>
                <i kbq-icon="kbq-plus-s_16"></i>
                Сохранить как новый
            </button>
            <button (click)="onChange()" (keydown.enter)="onChange()" kbq-dropdown-item>
                <i kbq-icon="kbq-pencil_16"></i>
                Изменить
            </button>

            <kbq-divider />

            <button (click)="onReset()" (keydown.enter)="onReset()" kbq-dropdown-item>
                <i kbq-icon="kbq-xmark-circle_16"></i>
                Сбросить изменения
            </button>
            <button (click)="onDelete()" (keydown.enter)="onDelete()" kbq-dropdown-item>
                <i kbq-icon="kbq-trash_16"></i>
                Удалить
            </button>
        </kbq-dropdown>
    `,
    styleUrls: ['filters.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-filters'
    },
    imports: [
        KbqButtonModule,
        KbqDropdownModule,
        KbqDividerModule,
        KbqIcon,
        KbqTitleModule,
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule,
        NgClass
    ]
})
export class KbqFilters {
    protected readonly filterBar = inject(KbqFilterBar);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    value: string;

    get activeFilter(): KbqFilter | null {
        return this.filterBar.activeFilter;
    }

    onSelectFilter(filter: KbqFilter) {
        this.filterBar.activeFilterChanges.next(filter);
    }

    onSave() {
        console.log('onSave: ');
    }

    onSaveAsNew() {
        console.log('onSaveAsNew: ');
    }

    onChange() {
        console.log('onChange: ');
    }

    onReset() {
        console.log('onReset: ');
    }

    onDelete() {
        console.log('onDelete: ');
    }
}
