import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    output,
    Signal,
    signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KBQ_ACTIONS_PANEL_DATA, KbqActionsPanel, KbqActionsPanelRef } from '@koobiq/components/actions-panel';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqTableModule } from '@koobiq/components/table';

type ExampleAction = {
    id: string;
    icon: string;
    divider?: boolean;
};

type ExampleTableItem = {
    id: number;
    threat: string;
    description: string;
    protectionMeasures: string;
    selected: boolean;
};

@Component({
    standalone: true,
    imports: [
        KbqTableModule,
        KbqCheckboxModule,
        FormsModule
    ],
    selector: 'example-table',
    template: `
        <table kbq-table>
            <thead>
                <tr>
                    <th></th>
                    <th [style.width.px]="100">Threat</th>
                    <th>Description</th>
                    <th>Protection measures</th>
                </tr>
            </thead>
            <tbody>
                @for (item of data; track item.id) {
                    <tr>
                        <td><kbq-checkbox [(ngModel)]="item.selected" (ngModelChange)="change()" /></td>
                        <td>{{ item.threat }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.protectionMeasures }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        :host {
            height: 300px;
            overflow-y: scroll;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTable {
    readonly data: ExampleTableItem[] = Array.from({ length: 10 }).map((_, id) => ({
        id,
        threat: 'DDoS attacks',
        description: 'Overloading the system with requests to make it unavailable',
        protectionMeasures: 'Using protective systems (e.g., CDN), traffic monitoring',
        selected: id < 2
    }));

    readonly selectedItems = output<ExampleTableItem[]>();

    constructor() {
        afterNextRender(() => this.change());
    }

    change(): void {
        this.selectedItems.emit(this.data.filter(({ selected }) => selected));
    }
}

@Component({
    standalone: true,
    imports: [
        KbqOverflowItemsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqDividerModule
    ],
    selector: 'example-actions-panel',
    template: `
        <div class="example-content">Selected: {{ data().length }}</div>
        <kbq-divider class="example-divider-vertical" [vertical]="true" />
        <kbq-overflow-items>
            @for (action of actions; track action.id; let first = $first) {
                <ng-container *kbqOverflowItem="action.id">
                    @if (action.divider) {
                        <kbq-divider class="example-divider-vertical" [vertical]="true" />
                    }
                    <button [class.layout-margin-left-xxs]="!first" color="contrast" kbq-button>
                        <i [class]="action.icon" kbq-icon></i>
                        {{ action.id }}
                    </button>
                </ng-container>
            }
            <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
                <button [kbqDropdownTriggerFor]="dropdown" color="contrast" kbq-button>
                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                </button>

                <kbq-dropdown #dropdown="kbqDropdown">
                    @for (action of actions; track action.id; let index = $index) {
                        @if (hiddenItemIDs.has(action.id)) {
                            @if (action.divider && hiddenItemIDs.has(actions[index - 1]?.id)) {
                                <kbq-divider />
                            }
                            <button kbq-dropdown-item>
                                <i [class]="action.icon" kbq-icon></i>
                                {{ action.id }}
                            </button>
                        }
                    }
                </kbq-dropdown>
            </ng-template>
        </kbq-overflow-items>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            overflow: hidden;
            flex-grow: 1;
        }

        .example-content {
            margin: 0 var(--kbq-size-m);
            flex-basis: 75px;
        }

        .example-divider-vertical {
            background-color: var(--kbq-actions-panel-vertical-divider-background-color);
            height: var(--kbq-actions-panel-vertical-divider-height) !important;
            margin: var(--kbq-actions-panel-vertical-divider-margin);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleActionsPanel {
    readonly data = inject<Signal<ExampleTableItem[]>>(KBQ_ACTIONS_PANEL_DATA);
    readonly actionsPanelRef = inject(KbqActionsPanelRef);

    readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Status', icon: 'kbq-arrow-right-s_16' },
        { id: 'Verdict', icon: 'kbq-question-circle_16' },
        { id: 'Link to incident', icon: 'kbq-link_16', divider: true },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16', divider: true },
        { id: 'Remove', icon: 'kbq-trash_16' }
    ];
}

/**
 * @title Actions panel overview
 */
@Component({
    standalone: true,
    imports: [ExampleTable],
    providers: [KbqActionsPanel],
    selector: 'actions-panel-overview-example',
    template: `
        <example-table (selectedItems)="toggleActionsPanel($event)" />
    `,
    styles: `
        :host {
            display: flex;
            padding-bottom: 25px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelOverviewExample {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject(ElementRef);
    private actionsPanelRef: KbqActionsPanelRef<ExampleActionsPanel> | null;
    private readonly data = signal<ExampleTableItem[]>([]);

    toggleActionsPanel(selectedItems: ExampleTableItem[]): void {
        this.data.set(selectedItems);

        if (selectedItems.length === 0) {
            return this.actionsPanel.close();
        }

        if (this.actionsPanelRef) {
            return;
        }

        this.actionsPanelRef = this.actionsPanel.open(ExampleActionsPanel, {
            width: '844px',
            data: this.data,
            overlayConnectedTo: this.elementRef
        });

        this.actionsPanelRef.afterClosed.subscribe(() => {
            this.actionsPanelRef = null;
        });
    }
}
