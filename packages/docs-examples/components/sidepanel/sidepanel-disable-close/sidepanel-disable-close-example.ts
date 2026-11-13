import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

@Component({
    selector: 'example-sidepanel-disable-close-content',
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">{{ t().sidepanel }}</kbq-sidepanel-header>
        <kbq-sidepanel-body>
            Clicking the backdrop or pressing Escape won't close this sidepanel. Use the button below or the close icon
            in the header instead.
        </kbq-sidepanel-body>
        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button color="contrast" kbq-sidepanel-close>
                    <span>{{ t().close }}</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleSidepanelDisableCloseContent {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

/**
 * @title Sidepanel with disabled close on backdrop click
 */
@Component({
    selector: 'sidepanel-disable-close-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="open()">
            <span>{{ t().open }}</span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelDisableCloseExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly sidepanelService = inject(KbqSidepanelService);

    open() {
        this.sidepanelService.open(ExampleSidepanelDisableCloseContent, {
            hasBackdrop: true,
            disableClose: true
        });
    }
}
