import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleChange, KbqButtonToggleGroup, KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { PopUpSizes } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToggleChange, KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Popover arrow and offset example
 */
@Component({
    standalone: true,
    selector: 'popover-arrow-and-offset-example',
    imports: [
        KbqButtonModule,
        KbqPopoverModule,
        KbqDlModule,
        KbqToggleModule,
        KbqButtonToggleModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <div class="layout-row layout-align-space-around-center">
            <div class="layout-row layout-align-center-center">
                <ng-template #customContent>
                    <div [style.width.px]="400">
                        <div class="layout-margin-bottom-s">I wonder what this?</div>
                        <kbq-form-field>
                            <input kbqInput placeholder="Interesting thought" />
                        </kbq-form-field>
                    </div>
                </ng-template>

                <ng-template #customFooter>
                    <div class="layout-row layout-wrap layout-gap-l">
                        <button color="contrast" kbq-button (click)="kbqPopover.hide(0)">Save</button>
                        <button kbq-button (click)="kbqPopover.hide(0)">Cancel</button>
                    </div>
                </ng-template>

                <button
                    #kbqPopover="kbqPopover"
                    kbq-button
                    kbqPopover
                    [kbqPopoverContent]="customContent"
                    [kbqPopoverFooter]="customFooter"
                    [kbqPopoverArrow]="arrow"
                    [kbqPopoverOffset]="offset"
                    [kbqPopoverSize]="popoverSize"
                >
                    Open popover
                </button>
            </div>

            <kbq-dl [vertical]="true">
                <kbq-dt>Arrow</kbq-dt>
                <kbq-dd>
                    <kbq-toggle [checked]="arrow" (change)="onArrowChange($event)" />
                </kbq-dd>

                <kbq-dt>Offset</kbq-dt>
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
export class PopoverArrowAndOffsetExample implements AfterViewInit {
    protected arrow = true;
    protected offset: number | null = null;
    protected offsetChanged = false;
    protected readonly popoverSize = PopUpSizes.Large;
    @ViewChild(KbqButtonToggleGroup) protected toggleGroup: KbqButtonToggleGroup;

    ngAfterViewInit() {
        Promise.resolve().then(() => {
            this.toggleGroup.buttonToggles.get(3)!.checked = true;
        });
    }

    onArrowChange({ checked }: KbqToggleChange) {
        if (!this.offsetChanged) {
            if (checked) {
                this.toggleGroup.buttonToggles.get(3)!.checked = true;
            } else {
                this.toggleGroup.buttonToggles.get(2)!.checked = true;
            }
        }

        this.arrow = checked;
    }

    onOffsetChange({ value }: KbqButtonToggleChange) {
        this.offsetChanged = true;
        this.offset = value;
    }
}
