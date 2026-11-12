import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Sidebar overview
 */
@Component({
    selector: 'sidebar-overview-example',
    imports: [KbqSidebarModule, KbqButtonModule],
    template: `
        <kbq-sidebar
            #leftSidebar="kbqSidebar"
            [opened]="leftOpened"
            [position]="position.Left"
            (stateChanged)="onStateChanged($event, position.Left)"
        >
            <div kbq-sidebar-opened width="170px">{{ text().leftOpenedContent }}</div>
            <div kbq-sidebar-closed width="44px">{{ text().leftClosedContent }}</div>
        </kbq-sidebar>

        <main>
            <div>{{ text().mainContent }}</div>
            <div>
                <button kbq-button (click)="toggleLeft()">{{ text().toggleLeftModel }}</button>
            </div>
            <div>
                <button kbq-button (click)="leftSidebar.toggle()">{{ text().toggleLeft }}</button>
            </div>
            <div>
                <button kbq-button (click)="toggleRight()">{{ text().toggleRightModel }}</button>
            </div>
            <div>
                <button kbq-button (click)="rightSidebar.toggle()">{{ text().toggleRight }}</button>
            </div>
        </main>

        <kbq-sidebar
            #rightSidebar="kbqSidebar"
            [opened]="rightOpened"
            [position]="position.Right"
            (stateChanged)="onStateChanged($event, position.Right)"
        >
            <div kbq-sidebar-opened width="170px">{{ text().rightOpenedContent }}</div>
            <div kbq-sidebar-closed width="44px">{{ text().rightClosedContent }}</div>
        </kbq-sidebar>
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
export class SidebarOverviewExample extends BaseLocalizedExample<ExampleText> {
    readonly position = SidebarPositions;

    leftOpened = true;
    rightOpened = false;

    toggleLeft(): void {
        this.leftOpened = !this.leftOpened;
    }

    toggleRight(): void {
        this.rightOpened = !this.rightOpened;
    }

    onStateChanged(opened: boolean, position: SidebarPositions): void {
        console.log(`Sidebar ${position} onStateChanged: `, opened);
    }

    constructor() {
        super(TEXT);
    }
}
