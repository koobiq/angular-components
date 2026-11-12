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
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
                {{ sidepanelRef() ? t().closeSidepanel : t().openSidepanel }}
            </button>

            <button kbq-button type="button" (click)="sidepanelService.clearSavedState(stateSavingKey)">
                {{ t().resetSavedState }}
            </button>
        </div>

        <ng-template>
            <kbq-sidepanel-header [closeable]="true">{{ t().stateSaving }}</kbq-sidepanel-header>
            <kbq-sidepanel-body>
                <div class="example-sidepanel-state-saving__body">
                    {{ t().body }}
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
export class SidepanelStateSavingExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly sidepanelService = inject(KbqSidepanelService);
    protected readonly stateSavingKey = stateSavingKey;
    protected readonly sidepanelRef = signal<KbqSidepanelRef | null>(null);

    private readonly template = viewChild.required(TemplateRef);

    constructor() {
        super(TRANSLATIONS);
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
