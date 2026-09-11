import {
    ChangeDetectionStrategy,
    Component,
    TemplateRef,
    afterNextRender,
    inject,
    signal,
    viewChild
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidepanelModule, KbqSidepanelRef, KbqSidepanelService } from '@koobiq/components/sidepanel';

const stateSavingKey = 'sidepanel-state-saving-example';

/**
 * @title Sidepanel state saving
 */
@Component({
    selector: 'sidepanel-state-saving-example',
    imports: [KbqButtonModule, KbqSidepanelModule],
    template: `
        <div class="example-sidepanel-state-saving__actions">
            <button kbq-button type="button" [color]="'contrast'" (click)="toggle()">
                {{ sidepanelRef() ? 'Close sidepanel' : 'Open sidepanel' }}
            </button>

            <button kbq-button type="button" (click)="sidepanelService.clearSavedState(stateSavingKey)">
                Reset saved state
            </button>
        </div>

        <ng-template>
            <kbq-sidepanel-header [closeable]="true">Sidepanel state saving</kbq-sidepanel-header>
            <kbq-sidepanel-body>
                <div class="example-sidepanel-state-saving__body">
                    Leave this panel open and reload the page — it opens again. The panel is non-modal, so nothing on
                    the page is blocked while it comes back.
                </div>
            </kbq-sidepanel-body>
        </ng-template>
    `,
    styles: `
        .example-sidepanel-state-saving__actions {
            display: flex;
            gap: var(--kbq-size-m);
        }

        .example-sidepanel-state-saving__body {
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelStateSavingExample {
    protected readonly sidepanelService = inject(KbqSidepanelService);
    protected readonly stateSavingKey = stateSavingKey;
    protected readonly sidepanelRef = signal<KbqSidepanelRef | null>(null);

    private readonly template = viewChild.required(TemplateRef);

    constructor() {
        // Once the view exists, so the template is there to open.
        afterNextRender(() => {
            if (this.sidepanelService.wasOpen(stateSavingKey)) this.open();
        });
    }

    protected toggle(): void {
        const opened = this.sidepanelRef();

        // Not closeAll(): closing a group is not recorded, so it would leave the panel remembered as open.
        if (opened) {
            opened.close();
        } else {
            this.open();
        }
    }

    private open(): void {
        const ref = this.sidepanelService.open(this.template(), { hasBackdrop: false, stateSavingKey });

        ref.afterClosed().subscribe(() => this.sidepanelRef.set(null));

        this.sidepanelRef.set(ref);
    }
}
