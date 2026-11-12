import { AfterViewInit, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleChange, KbqButtonToggleGroup, KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { PopUpSizes } from '@koobiq/components/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToggleChange, KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Popover arrow and offset example
 */
@Component({
    selector: 'popover-arrow-and-offset-example',
    imports: [
        KbqButtonModule,
        KbqPopoverModule,
        KbqDl,
        KbqDt,
        KbqDd,
        KbqToggleModule,
        KbqButtonToggleModule,
        KbqInputModule
    ],
    template: `
        <div class="layout-row layout-align-space-around-center">
            <div class="layout-row layout-align-center-center">
                <ng-template #customContent>
                    <div [style.width.px]="400">
                        <div class="layout-margin-bottom-s">{{ text().wonder }}</div>
                        <kbq-form-field>
                            <input kbqInput placeholder="Interesting thought" />
                        </kbq-form-field>
                    </div>
                </ng-template>

                <ng-template #customFooter>
                    <div class="layout-row layout-wrap layout-gap-l">
                        <button color="contrast" kbq-button (click)="kbqPopover.hide(0)">{{ text().save }}</button>
                        <button kbq-button (click)="kbqPopover.hide(0)">{{ text().cancel }}</button>
                    </div>
                </ng-template>

                <button
                    #kbqPopover="kbqPopover"
                    kbq-button
                    kbqPopover
                    [kbqPopoverContent]="customContent"
                    [kbqPopoverFooter]="customFooter"
                    [kbqPopoverArrow]="arrow"
                    [kbqPopoverArrowCentered]="arrowCentered"
                    [kbqPopoverOffset]="offset"
                    [kbqPopoverPlacement]="'bottomRight'"
                    [kbqPopoverSize]="popoverSize"
                >
                    Open popover
                </button>
            </div>

            <kbq-dl [vertical]="true">
                <kbq-dt>{{ text().arrow }}</kbq-dt>
                <kbq-dd>
                    <kbq-toggle [checked]="arrow" (change)="onArrowChange($event)" />
                </kbq-dd>

                <kbq-dt>{{ text().arrowCentered }}</kbq-dt>
                <kbq-dd>
                    <kbq-toggle [checked]="arrowCentered" (change)="arrowCentered = $event.checked" />
                </kbq-dd>

                <kbq-dt>{{ text().offset }}</kbq-dt>
                <kbq-dd>
                    <kbq-button-toggle-group [value]="offset" (change)="onOffsetChange($event)">
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
export class PopoverArrowAndOffsetExample extends BaseLocalizedExample<ExampleText> implements AfterViewInit {
    protected arrow = true;
    protected arrowCentered = false;
    protected offset: number | null = null;
    protected offsetChanged = false;
    protected readonly popoverSize = PopUpSizes.Large;
    protected readonly toggleGroup = viewChild.required(KbqButtonToggleGroup);

    ngAfterViewInit() {
        Promise.resolve().then(() => {
            this.toggleGroup().buttonToggles().at(3)!.checked = true;
        });
    }

    onArrowChange({ checked }: KbqToggleChange) {
        if (!this.offsetChanged) {
            if (checked) {
                this.toggleGroup().buttonToggles().at(3)!.checked = true;
            } else {
                this.toggleGroup().buttonToggles().at(2)!.checked = true;
            }
        }

        this.arrow = checked;
    }

    onOffsetChange({ value }: KbqButtonToggleChange) {
        this.offsetChanged = true;
        this.offset = value;
    }

    constructor() {
        super(TEXT);
    }
}
