import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { KbqButtonToggleGroup } from '@koobiq/components/button-toggle';

/**
 * @title Tooltip Arrow And Offset Example
 */
@Component({
    selector: 'tooltip-arrow-and-offset-example',
    templateUrl: 'tooltip-arrow-and-offset-example.html',
    styleUrls: ['tooltip-arrow-and-offset-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipArrowAndOffsetExample implements AfterViewInit {
    arrow: boolean = true;
    offset: number | null = null;
    offsetChanged = false;
    @ViewChild(KbqButtonToggleGroup) toggleGroup: KbqButtonToggleGroup;

    ngAfterViewInit() {
        this.toggleGroup.buttonToggles.get(3)!.checked = true;
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
