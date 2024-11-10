import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Badge tooltip
 */
@Component({
    standalone: true,
    selector: 'badge-tooltip-example',
    styleUrls: ['badge-tooltip-example.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqBadgeModule,
        KbqToolTipModule
    ],
    template: `
        <div class="badge-tooltip-example">
            <kbq-badge
                [badgeColor]="colors.FadeContrast"
                [kbqPlacement]="PopUpPlacements.Top"
                [kbqTooltipArrow]="false"
                [kbqTooltip]="tooltipText"
            >
                DoS
            </kbq-badge>
        </div>
    `
})
export class BadgeTooltipExample {
    colors = KbqBadgeColors;
    protected readonly PopUpPlacements = PopUpPlacements;

    tooltipText =
        'DoS (аббр. англ. denial-of-service attack «отказ в обслуживании») — хакерская атака на вычислительную систему с целью довести ее до отказа, то есть создание таких условий, при которых добросовестные пользователи системы не смогут получить доступ к предоставляемым системным ресурсам (серверам), либо этот доступ будет затруднен';
}
