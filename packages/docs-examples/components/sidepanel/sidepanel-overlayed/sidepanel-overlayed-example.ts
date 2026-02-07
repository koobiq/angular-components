import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel overlayed
 */
@Component({
    selector: 'sidepanel-overlayed-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    templateUrl: './sidepanel-overlayed-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelOverlayedExample {
    protected position = KbqSidepanelPosition.Right;

    protected readonly overlaysCount = 2;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    protected readonly arrayLength = 40;
    protected readonly array = new Array(this.arrayLength);

    private sidepanelService = inject(KbqSidepanelService);

    openSidepanel(): void {
        for (let i = 0; i < this.overlaysCount; i++) {
            this.sidepanelService.open(this.template, {
                position: this.position,
                hasBackdrop: false
            });
        }
    }

    openAnotherSidepanel(): void {
        this.sidepanelService.open(this.template, {
            position: this.position,
            hasBackdrop: false
        });
    }
}
