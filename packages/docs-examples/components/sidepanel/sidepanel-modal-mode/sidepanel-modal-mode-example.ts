import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel modal mode
 */
@Component({
    selector: 'sidepanel-modal-mode-example',
    templateUrl: 'sidepanel-modal-mode-example.html',
    styleUrls: ['sidepanel-modal-mode-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SidepanelModalModeExample {
    position = KbqSidepanelPosition.Right;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);
    constructor(private sidepanelService: KbqSidepanelService) {}

    openSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: true
        });
    }
}
