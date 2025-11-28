import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel modal mode
 */
@Component({
    selector: 'sidepanel-modal-mode-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    templateUrl: 'sidepanel-modal-mode-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
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
