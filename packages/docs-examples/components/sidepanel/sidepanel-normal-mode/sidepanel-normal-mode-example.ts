import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { take } from 'rxjs/operators';

/**
 * @title Sidepanel normal mode
 */
@Component({
    selector: 'sidepanel-normal-mode-example',
    imports: [KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    templateUrl: 'sidepanel-normal-mode-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelNormalModeExample {
    private sidepanelService = inject(KbqSidepanelService);

    position = KbqSidepanelPosition.Right;

    isOpened = false;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength);

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
