import { Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel modal mode
 */
@Component({
    standalone: true,
    selector: 'sidepanel-modal-mode-example',
    templateUrl: 'sidepanel-modal-mode-example.html',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqSidepanelModule]
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
