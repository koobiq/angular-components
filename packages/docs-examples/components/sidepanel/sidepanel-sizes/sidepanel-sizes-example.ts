import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqSidepanelModule,
    KbqSidepanelPosition,
    KbqSidepanelService,
    KbqSidepanelSize
} from '@koobiq/components/sidepanel';

/**
 * @title Sidepanel sizes
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'sidepanel-sizes-example',
    templateUrl: 'sidepanel-sizes-example.html',
    imports: [
        KbqButtonModule,
        KbqSidepanelModule
    ]
})
export class SidepanelSizesExample {
    size = KbqSidepanelPosition.Right;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);
    constructor(private sidepanelService: KbqSidepanelService) {}

    showSmall() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Small
        });
    }

    showMedium() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Medium
        });
    }

    showLarge() {
        this.sidepanelService.open(this.template, {
            position: KbqSidepanelPosition.Right,
            size: KbqSidepanelSize.Large
        });
    }
}
