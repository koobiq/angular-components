import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip extended
 */
@Component({
    selector: 'tooltip-extended-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button
            kbq-button
            [kbqExtendedTooltip]="tooltipContent"
            [kbqTooltipClass]="'custom-tooltip'"
            [kbqTooltipHeader]="tooltipHeader"
        >
            Кнопка со сложным тултипом
        </button>

        <ng-template #tooltipContent>
            <div>
                В западной традиции рыбой выступает фрагмент латинского текста из философского трактата Цицерона «О
                пределах добра и зла», написанного в 45 году до нашей эры. Впервые этот текст был применен для набора
                шрифтовых образцов неизвестным печатником еще в XVI веке.
            </div>
        </ng-template>

        <ng-template #tooltipHeader>
            <span>Заголовок</span>
        </ng-template>
    `,
    styles: `
        .custom-tooltip {
            max-width: 485px !important;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipExtendedExample {}
