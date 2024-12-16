import { ChangeDetectionStrategy, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipe } from '../filter-bar.types';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[select]',
    template: `
        <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" kbq-button [kbqDropdownTriggerFor]="items">
            {{ data.name }}
        </button>

        <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" kbq-button (click)="onDelete()">
            <i kbq-icon="kbq-xmark-s_16"></i>
        </button>

        <kbq-dropdown #items="kbqDropdown">
            @for (value of values; track value) {
                <button kbq-dropdown-item>{{ value }}</button>
            }
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
        KbqDividerModule,
        KbqDropdownModule
    ]
})
export class KbqPipeSelectComponent extends KbqPipeBase {
    protected readonly filterBar = inject(KbqFilterBar);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    @Input() data!: KbqPipe;
}
