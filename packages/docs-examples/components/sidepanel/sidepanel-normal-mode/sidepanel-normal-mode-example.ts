import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { take } from 'rxjs/operators';

/**
 * @title Sidepanel normal mode
 */
@Component({
    selector: 'sidepanel-normal-mode-example',
    templateUrl: 'sidepanel-normal-mode-example.html',
    styleUrls: ['sidepanel-normal-mode-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SidepanelNormalModeExample {
    position = KbqSidepanelPosition.Right;

    isOpened = false;

    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    arrayLength = 40;
    array = new Array(this.arrayLength); // tslint:disable-line

    constructor(private sidepanelService: KbqSidepanelService) {}

    toggleSidepanel() {
        if (!this.isOpened) {
            const sidepanel = this.sidepanelService.open(this.template, {
                position: this.position,
                hasBackdrop: false,
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
