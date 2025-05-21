import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, KbqSidebarPositions } from '@koobiq/components/sidebar';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Sidebar with splitter
 */
@Component({
    standalone: true,
    imports: [KbqSidebarModule, KbqButtonModule, KbqSplitterModule],
    selector: 'sidebar-with-splitter-example',
    template: `
        <kbq-splitter [direction]="direction.Horizontal" [disabled]="!opened()">
            <kbq-sidebar
                #sidebar="kbqSidebar"
                [(opened)]="opened"
                [position]="position.Left"
                (openedChange)="onOpenedChange($event)"
                kbq-splitter-area
            >
                <div kbqSidebarOpened minWidth="170px" width="170px" maxWidth="50%">Opened content</div>
                <div kbqSidebarClosed width="44px">Closed content</div>
            </kbq-sidebar>

            <main kbq-splitter-area>
                <div>Main content</div>
                <div><button (click)="toggle()" kbq-button>Toggle model</button></div>
                <div><button (click)="sidebar.toggle()" kbq-button>Toggle</button></div>
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
    readonly position = KbqSidebarPositions;
    readonly opened = model(true);

    toggle(): void {
        this.opened.update((opened) => !opened);
    }

    onOpenedChange(opened: boolean): void {
        console.log('Sidebar opened: ', opened);
    }
}
