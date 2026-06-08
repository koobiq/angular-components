import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
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

    @ViewChild('template', { static: false }) template: TemplateRef<any>;

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {}

    openPanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            size: this.size
        });
    }
}
