import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Sidebar with splitter
 */
@Component({
    selector: 'sidebar-with-splitter-example',
    imports: [KbqSidebarModule, KbqButtonModule, KbqSplitterModule],
    template: `
        <kbq-splitter [direction]="direction.Horizontal" [disabled]="!opened">
            <kbq-sidebar
                #sidebar="kbqSidebar"
                kbq-splitter-area
                [opened]="opened"
                [position]="position.Left"
                (stateChanged)="onStateChanged($event)"
            >
                <div kbq-sidebar-opened minWidth="170px" width="170px" maxWidth="50%">Opened content</div>
                <div kbq-sidebar-closed width="44px">Closed content</div>
            </kbq-sidebar>

            <main kbq-splitter-area>
                <div>Main content</div>
                <div><button kbq-button (click)="toggle()">Toggle model</button></div>
                <div><button kbq-button (click)="sidebar.toggle()">Toggle</button></div>
            </main>
        </kbq-splitter>
    `,
    styles: `
        :host {
            display: flex;
            height: 250px;
        }

        .kbq-splitter {
            flex-grow: 1;
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
export class SidebarWithSplitterExample {
    readonly direction = Direction;
    readonly position = SidebarPositions;

    opened = true;

    toggle(): void {
        this.opened = !this.opened;
    }

    onStateChanged(opened: boolean): void {
        console.log('onStateChanged: ', opened);
    }
}
