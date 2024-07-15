import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel overlayed
 */
@Component({
    selector: 'sidepanel-overlayed-example',
    templateUrl: 'sidepanel-overlayed-example.html',
    styleUrls: ['sidepanel-overlayed-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SidepanelOverlayedExample {
    position = KbqSidepanelPosition.Right;

    overlaysCount = 2;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength); // tslint:disable-line

    constructor(private sidepanelService: KbqSidepanelService) {}

    openSidepanel() {
        for (let i = 0; i < this.overlaysCount; i++) {
            this.sidepanelService.open(this.template, {
                position: this.position,
                hasBackdrop: false,
            });
        }
    }
}
