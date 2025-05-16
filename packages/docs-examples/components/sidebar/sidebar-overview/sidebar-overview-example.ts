import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, KbqSidebarPositions } from '@koobiq/components/sidebar';

/**
 * @title Sidebar overview
 */
@Component({
    standalone: true,
    imports: [KbqSidebarModule, KbqButtonModule],
    selector: 'sidebar-overview-example',
    template: `
        <kbq-sidebar
            #leftSidebar="kbqSidebar"
            [(opened)]="leftOpened"
            [position]="position.Left"
            (stateChanged)="onStateChanged($event, position.Left)"
        >
            <div kbqSidebarOpened width="170px">Left opened content</div>
            <div kbqSidebarClosed width="44px">Left closed content</div>
        </kbq-sidebar>

        <main>
            <div>Main content</div>
            <div><button (click)="toggleLeft()" kbq-button>Toggle left model</button></div>
            <div><button (click)="leftSidebar.toggle()" kbq-button>Toggle left</button></div>
            <div><button (click)="toggleRight()" kbq-button>Toggle right model</button></div>
            <div><button (click)="rightSidebar.toggle()" kbq-button>Toggle right</button></div>
        </main>

        <kbq-sidebar
            #rightSidebar="kbqSidebar"
            [(opened)]="rightOpened"
            [position]="position.Right"
            (stateChanged)="onStateChanged($event, position.Right)"
        >
            <div kbqSidebarOpened width="170px">Right opened content</div>
            <div kbqSidebarClosed width="44px">Right closed content</div>
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
export class SidebarOverviewExample {
    readonly position = KbqSidebarPositions;
    readonly leftOpened = model(true);
    readonly rightOpened = model(false);

    toggleLeft(): void {
        this.leftOpened.update((opened) => !opened);
    }

    toggleRight(): void {
        this.rightOpened.update((opened) => !opened);
    }

    onStateChanged(opened: boolean, position: KbqSidebarPositions): void {
        console.log(`Sidebar ${position} onStateChanged: `, opened);
    }
}
