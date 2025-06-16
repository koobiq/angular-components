import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqSidepanelModule,
    KbqSidepanelPosition,
    KbqSidepanelService,
    KbqSidepanelSize
} from '@koobiq/components/sidepanel';

/**
 * @title Accordion in panel
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'accordion-in-panel-example',
    templateUrl: 'accordion-in-panel-example.html',
    imports: [KbqAccordionModule, KbqSidepanelModule, KbqButtonModule]
})
export class AccordionInPanelExample {
    position: KbqSidepanelPosition = KbqSidepanelPosition.Right;
    size: KbqSidepanelSize = KbqSidepanelSize.Medium;

    @ViewChild('template', { static: false }) template: TemplateRef<any>;

    constructor(private sidepanelService: KbqSidepanelService) {}

    openPanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            size: this.size
        });
    }
}
