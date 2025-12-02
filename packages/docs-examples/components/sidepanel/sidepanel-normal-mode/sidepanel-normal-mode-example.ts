import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { take } from 'rxjs/operators';

/**
 * @title Sidepanel normal mode
 */
@Component({
    selector: 'sidepanel-normal-mode-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    templateUrl: 'sidepanel-normal-mode-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelNormalModeExample {
    position = KbqSidepanelPosition.Right;

    isOpened = false;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);
    constructor(private sidepanelService: KbqSidepanelService) {}

    toggleSidepanel() {
        if (!this.isOpened) {
            const sidepanel = this.sidepanelService.open(this.template, {
                position: this.position,
                hasBackdrop: false
            });

            sidepanel
                .afterClosed()
                .pipe(take(1))
                .subscribe(() => {
                    this.isOpened = false;
                });
            this.isOpened = true;
        } else {
            this.sidepanelService.closeAll();
        }
    }
}
