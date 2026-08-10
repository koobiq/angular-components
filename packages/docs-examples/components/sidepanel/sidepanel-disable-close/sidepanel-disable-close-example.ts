import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';

@Component({
    selector: 'example-sidepanel-disable-close-content',
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">Sidepanel</kbq-sidepanel-header>
        <kbq-sidepanel-body>
            Clicking the backdrop or pressing Escape won't close this sidepanel. Use the button below or the close icon
            in the header instead.
        </kbq-sidepanel-body>
        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button color="contrast" kbq-sidepanel-close>
                    <span>Close</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'layout-column flex' }
})
export class ExampleSidepanelDisableCloseContent {}

/**
 * @title Sidepanel with disabled close on backdrop click
 */
@Component({
    selector: 'sidepanel-disable-close-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="open()">
            <span>Open</span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelDisableCloseExample {
    private readonly sidepanelService = inject(KbqSidepanelService);

    open() {
        this.sidepanelService.open(ExampleSidepanelDisableCloseContent, {
            hasBackdrop: true,
            disableClose: true
        });
    }
}
