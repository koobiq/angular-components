import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
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
    selector: 'accordion-in-panel-example',
    imports: [KbqAccordionModule, KbqSidepanelModule, KbqButtonModule],
    templateUrl: 'accordion-in-panel-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionInPanelExample {
    private sidepanelService = inject(KbqSidepanelService);

    position: KbqSidepanelPosition = KbqSidepanelPosition.Right;
    size: KbqSidepanelSize = KbqSidepanelSize.Medium;

    readonly template = viewChild.required<TemplateRef<any>>('template');

    openPanel() {
        this.sidepanelService.open(this.template(), {
            position: this.position,
            size: this.size
        });
    }
}
