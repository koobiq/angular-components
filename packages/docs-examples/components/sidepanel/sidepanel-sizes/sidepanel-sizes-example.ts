import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { KbqSidepanelPosition, KbqSidepanelService, KbqSidepanelSize } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel sizes
 */
@Component({
    selector: 'sidepanel-sizes-example',
    templateUrl: 'sidepanel-sizes-example.html',
    styleUrls: ['sidepanel-sizes-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SidepanelSizesExample {
    size = KbqSidepanelPosition.Right;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength); // tslint:disable-line

    constructor(private sidepanelService: KbqSidepanelService) {}

    showSmall() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Small,
        });
    }

    showMedium() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Medium,
        });
    }

    showLarge() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Large,
        });
    }
}
