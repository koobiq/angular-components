import { Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel overlayed
 */
@Component({
    standalone: true,
    selector: 'sidepanel-overlayed-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    templateUrl: './sidepanel-overlayed-example.html'
})
export class SidepanelOverlayedExample {
    position = KbqSidepanelPosition.Right;

    overlaysCount = 2;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);
    constructor(private sidepanelService: KbqSidepanelService) {}

    openSidepanel() {
        for (let i = 0; i < this.overlaysCount; i++) {
            this.sidepanelService.open(this.template, {
                position: this.position,
                hasBackdrop: false
            });
        }
    }
}
