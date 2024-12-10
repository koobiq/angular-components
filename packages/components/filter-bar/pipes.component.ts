import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '../form-field';
import { KbqIcon } from '../icon';
import { KbqInputModule } from '../input';
import { KbqTitleModule } from '../title';
import { KbqPipe } from './pipes/pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipes',
    template: `
        @for (filter of filters; track filter) {
            <kbq-pipe />
        }

        <kbq-dropdown #dropdown="kbqDropdown">
            <kbq-form-field kbqFormFieldWithoutBorders>
                <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>

                <input [value]="value" kbqInput placeholder="Placeholder" />

                <kbq-cleaner />
            </kbq-form-field>

            <kbq-divider />

            @for (filter of filters; track filter) {
                <button kbq-dropdown-item>{{ filter.name }}</button>
            }

            <kbq-divider />

            <button disabled kbq-dropdown-item>Disabled</button>
        </kbq-dropdown>
    `,
    styleUrls: ['pipes.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipes'
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
        KbqPipe
    ]
})
export class KbqPipes {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    value: string;

    filters = [
        {
            name: 'filter 1',
            value: '1'
        },
        {
            name: 'filter 2',
            value: '2'
        },
        {
            name: 'filter 3',
            value: '3'
        }
    ];
}
