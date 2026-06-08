import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel modal mode
 */
@Component({
    selector: 'sidepanel-overview-example',
    imports: [KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    templateUrl: 'sidepanel-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelOverviewExample {
    private sidepanelService = inject(KbqSidepanelService);

    position = KbqSidepanelPosition.Right;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);
    constructor() {}

    openSidepanel() {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: true
        });
    }
}
