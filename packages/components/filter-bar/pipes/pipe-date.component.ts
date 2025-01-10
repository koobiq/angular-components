import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule } from '@koobiq/components/list';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqDatepickerModule } from '../../datepicker';
import { KbqTimepickerModule } from '../../timepicker';
import { KbqPipe } from '../filter-bar.types';
import { KbqPipeBase } from './pipe.component';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';

@Component({
    standalone: true,
    selector: 'kbq-pipe[date]',
    template: `
        <button
            [color]="colors.ContrastFade"
            [kbqStyle]="styles.Outline"
            [kbqPopoverContent]="content"
            [kbqPopoverArrow]="false"
            [kbqPopoverOffset]="0"
            [kbqPopoverPlacement]="placements.BottomLeft"
            [kbqPopoverClass]="'kbq-pipe-date__popover'"
            kbq-button
            kbqPopover
        >
            {{ data.name }}
        </button>

        <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" (click)="onDeleteOrClear()" kbq-button>
            <i kbq-icon="kbq-xmark-s_16"></i>
        </button>

        <ng-template #content>
            @if (list) {
                <kbq-list-selection>
                    <kbq-list-option [value]="0" (click)="list = false">
                        Произвольный период
                        <i class="kbq kbq-icon kbq-chevron-right_16 kbq-contrast-fade"></i>
                    </kbq-list-option>
                    <kbq-list-option [value]="1">Последний час</kbq-list-option>
                    <kbq-list-option [value]="2">Последние 3 часа</kbq-list-option>
                    <kbq-list-option [value]="3">Последние 24 часа</kbq-list-option>
                    <kbq-list-option [value]="4">Последние 3 дня</kbq-list-option>
                    <kbq-list-option [value]="5">Последние 7 дней</kbq-list-option>
                    <kbq-list-option [value]="6">Последние 30 дней</kbq-list-option>
                    <kbq-list-option [value]="7">Последние 90 дней</kbq-list-option>
                    <kbq-list-option [value]="8">Последний год</kbq-list-option>
                </kbq-list-selection>
            } @else {
                <button [color]="colors.ContrastFade" [kbqStyle]="styles.Outline" (click)="list = true" kbq-button>
                    <i kbq-icon="kbq-chevron-left_16"></i>
                    Назад к выбору периода
                </button>
                <hr />

                <div>
                    <kbq-form-field (click)="startDatepicker.toggle()">
                        <input [kbqDatepicker]="startDatepicker" [ngModel]="startDate" />
                        <i kbq-icon="kbq-calendar-o_16" kbqSuffix></i>
                        <kbq-datepicker #startDatepicker />
                    </kbq-form-field>

                    <kbq-form-field>
                        <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                        <input [ngModel]="startDate" kbqTimepicker />
                    </kbq-form-field>
                </div>

                <div>
                    <kbq-form-field (click)="datepicker.toggle()">
                        <input [kbqDatepicker]="datepicker" [ngModel]="endDate" />
                        <i kbq-icon="kbq-calendar-o_16" kbqSuffix></i>
                        <kbq-datepicker #datepicker />
                    </kbq-form-field>

                    <kbq-form-field>
                        <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                        <input [ngModel]="endDate" kbqTimepicker />
                    </kbq-form-field>
                </div>

                <button
                    [color]="'theme'"
                    [kbqStyle]="'transparent'"
                    [disabled]="isEmpty"
                    kbq-button
                >
                    <span>Применить</span>
                    &nbsp;
                    <span class="kbq-button_hot-key">Ctrl + Enter</span>
                </button>
            }
        </ng-template>
    `,
    styleUrls: ['pipe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe'
    },
    imports: [
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        KbqDividerModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqListModule,
        FormsModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqLuxonDateModule
    ],
    providers: [
        {
            provide: KbqPipeBase,
            useExisting: KbqPipeDateComponent
        }
    ]
})
export class KbqPipeDateComponent extends KbqPipeBase {
    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;
    protected startDate;
    protected endDate;

    @Input() data!: KbqPipe;

    get isEmpty(): boolean {
        return false;
    }
}
