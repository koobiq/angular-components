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

@Component({
    standalone: true,
    selector: 'kbq-filters',
    template: `
        <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" [kbqDropdownTriggerFor]="dropdown" kbq-button>
            <ng-content />
        </button>

        <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" kbq-button>
            <i kbq-icon="kbq-floppy-disk_16" kbqPrefix></i>
        </button>

        <kbq-dropdown #dropdown="kbqDropdown">
            <kbq-form-field kbqFormFieldWithoutBorders>
                <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>

                <input [value]="value" kbqInput placeholder="Placeholder" />

                <kbq-cleaner />
            </kbq-form-field>

            <kbq-divider />

            @for (filter of filterBar.filters; track filter) {
                <button kbq-dropdown-item>{{ filter.name }}</button>
            }

            <kbq-divider />

            <button disabled kbq-dropdown-item>Disabled</button>
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
        ReactiveFormsModule
    ]
})
export class KbqFilters {
    protected readonly filterBar = inject(KbqFilterBar);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    value: string;
}
