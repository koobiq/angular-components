import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { take } from 'rxjs/operators';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Sidepanel normal mode
 */
@Component({
    selector: 'sidepanel-normal-mode-example',
    imports: [KbqSelectModule, KbqButtonModule, KbqSidepanelModule],
    templateUrl: 'sidepanel-normal-mode-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelNormalModeExample extends BaseLocalizedExample<ExampleTranslation> {
    private sidepanelService = inject(KbqSidepanelService);

    position = KbqSidepanelPosition.Right;

    isOpened = false;

    readonly template = viewChild.required(TemplateRef);

    arrayLength = 40;
    array = new Array(this.arrayLength);

    toggleSidepanel() {
        if (!this.isOpened) {
            const sidepanel = this.sidepanelService.open(this.template(), {
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

    constructor() {
        super(TRANSLATIONS);
    }
}
