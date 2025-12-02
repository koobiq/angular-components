import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleGroup, KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip arrow and offset example
 */
@Component({
    selector: 'tooltip-arrow-and-offset-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqDlModule,
        KbqToggleModule,
        FormsModule,
        KbqButtonToggleModule
    ],
    template: `
        <div class="layout-row layout-align-space-around-center">
            <div class="layout-row layout-align-center-center">
                <button
                    kbq-button
                    kbqTooltip="Очень длинное название на тултипе"
                    [kbqTooltipArrow]="arrow"
                    [kbqTooltipOffset]="offset"
                >
                    Кнопка с тултипом
                </button>
            </div>

            <kbq-dl [vertical]="true">
                <kbq-dt>Arrow</kbq-dt>
                <kbq-dd>
                    <kbq-toggle [ngModel]="arrow" (ngModelChange)="onArrowChange($event)" />
                </kbq-dd>

                <kbq-dt>Offset</kbq-dt>
                <kbq-dd>
                    <kbq-button-toggle-group [ngModel]="offset" (ngModelChange)="onOffsetChange($event)">
                        <kbq-button-toggle [value]="-4">-4px</kbq-button-toggle>
                        <kbq-button-toggle [value]="0">0px</kbq-button-toggle>
                        <kbq-button-toggle [value]="4">4px</kbq-button-toggle>
                        <kbq-button-toggle [value]="8">8px</kbq-button-toggle>
                    </kbq-button-toggle-group>
                </kbq-dd>
            </kbq-dl>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipArrowAndOffsetExample implements AfterViewInit {
    arrow: boolean = true;
    offset: number | null = null;
    offsetChanged = false;
    @ViewChild(KbqButtonToggleGroup) toggleGroup: KbqButtonToggleGroup;

    ngAfterViewInit() {
        Promise.resolve().then(() => {
            this.toggleGroup.buttonToggles.get(3)!.checked = true;
        });
    }

    onArrowChange(arrow: boolean) {
        if (!this.offsetChanged) {
            if (arrow) {
                this.toggleGroup.buttonToggles.get(3)!.checked = true;
            } else {
                this.toggleGroup.buttonToggles.get(2)!.checked = true;
            }
        }

        this.arrow = arrow;
    }

    onOffsetChange(offset: number) {
        this.offsetChanged = true;
        this.offset = offset;
    }
}
