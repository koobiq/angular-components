import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPipe } from '../filter-bar.types';

@Component({
    standalone: true,
    selector: 'kbq-pipe, [kbq-pipe]',
    template: `
        <button [color]="colors.ContrastFade" [kbqDropdownTriggerFor]="dropdown" [kbqStyle]="styles.Outline" kbq-button>
            {{ data.name }}
        </button>

        <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" kbq-button>
            <i kbq-icon="kbq-xmark-s_16"></i>
        </button>

        <kbq-dropdown #dropdown="kbqDropdown">
            <kbq-form-field kbqFormFieldWithoutBorders>
                <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>

                <input [value]="''" kbqInput placeholder="Placeholder" />

                <kbq-cleaner />
            </kbq-form-field>

            <kbq-divider />

            <button kbq-dropdown-item>filter.name</button>

            <kbq-divider />

            <button disabled kbq-dropdown-item>Disabled</button>
        </kbq-dropdown>
    `,
    styleUrls: ['pipe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe'
    },
    imports: [
        KbqButtonModule,
        KbqDropdownModule,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        KbqDividerModule
    ]
})
export class KbqPipeComponent {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    @Input() data!: KbqPipe;
}