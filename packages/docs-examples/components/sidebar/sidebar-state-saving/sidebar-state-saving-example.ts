import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Sidebar state saving
 */
@Component({
    selector: 'sidebar-state-saving-example',
    imports: [KbqSidebarModule, KbqButtonModule],
    template: `
        <!-- No opened binding: the sidebar owns its state, which is what lets it persist. -->
        <kbq-sidebar #sidebar="kbqSidebar" stateSavingKey="sidebar-state-saving-example" [position]="position.Left">
            <div kbq-sidebar-opened width="170px">{{ text().openedContent }}</div>
            <div kbq-sidebar-closed width="44px">{{ text().closedContent }}</div>
        </kbq-sidebar>

        <main>
            <div>{{ text().stateSavingHint }}</div>
            <div>
                <button kbq-button type="button" (click)="sidebar.toggle()">{{ text().toggle }}</button>
            </div>
            <div>
                <button kbq-button type="button" (click)="sidebar.clearSavedState()">
                    {{ text().resetSavedState }}
                </button>
            </div>
        </main>
    `,
    styles: `
        :host {
            display: flex;
            height: 250px;
        }

        .kbq-sidebar {
            background-color: var(--kbq-background-bg-secondary);
        }

        .kbq-sidebar-opened,
        .kbq-sidebar-closed {
            padding: var(--kbq-size-m);
        }

        .kbq-sidebar-closed {
            box-sizing: border-box;
            writing-mode: sideways-lr;
            text-align: center;
        }

        main {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarStateSavingExample extends BaseLocalizedExample<ExampleText> {
    readonly position = SidebarPositions;

    constructor() {
        super(TEXT);
    }
}
