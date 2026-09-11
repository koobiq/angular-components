import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';
import { KbqSplitter, KbqSplitterPanel } from '@koobiq/components/splitter';

/**
 * @title Sidebar with splitter
 */
@Component({
    selector: 'sidebar-with-splitter-example',
    imports: [KbqSidebarModule, KbqButtonModule, KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter [disabled]="collapsed()">
            <kbq-splitter-panel
                collapsible
                [collapsedSize]="44"
                [maxSize]="'50%'"
                [minSize]="170"
                [size]="170"
                [(collapsed)]="collapsed"
            >
                <kbq-sidebar
                    #sidebar="kbqSidebar"
                    [opened]="opened()"
                    [position]="position.Left"
                    (stateChanged)="onStateChanged($event)"
                >
                    <div kbq-sidebar-opened>Opened content</div>
                    <div kbq-sidebar-closed>Closed content</div>
                </kbq-sidebar>
            </kbq-splitter-panel>

            <kbq-splitter-panel>
                <main>
                    <div>Main content</div>
                    <div><button kbq-button (click)="toggle()">Toggle model</button></div>
                    <div><button kbq-button (click)="sidebar.toggle()">Toggle</button></div>
                </main>
            </kbq-splitter-panel>
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
            height: 100%;
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
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarWithSplitterExample {
    protected readonly position = SidebarPositions;
    protected readonly collapsed = signal(false);
    protected readonly opened = computed(() => !this.collapsed());

    protected toggle(): void {
        this.collapsed.update((collapsed) => !collapsed);
    }

    protected onStateChanged(opened: boolean): void {
        this.collapsed.set(!opened);
    }
}
