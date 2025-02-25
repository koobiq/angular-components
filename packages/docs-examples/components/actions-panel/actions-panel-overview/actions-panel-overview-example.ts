import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    output,
    Signal,
    signal,
    viewChild
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

    reset(): void {
        this.data.forEach((item) => (item.selected = false));
        this.change();
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
        <kbq-overflow-items>
            <ng-container *kbqOverflowItem="'content'">
                <div class="example-content">Selected: {{ data().length }}</div>
                <kbq-divider class="example-divider-vertical" [vertical]="true" />
            </ng-container>

            @for (action of actions; track action.id; let first = $first) {
                <ng-container *kbqOverflowItem="action.id">
                    @if (action.divider) {
                        <kbq-divider class="example-divider-vertical" [vertical]="true" />
                    }
                    <button
                        [class.layout-margin-left-xxs]="!first"
                        (click)="onAction(action)"
                        color="contrast"
                        kbq-button
                    >
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
                    @if (hiddenItemIDs.has('content')) {
                        <div>Selected: {{ data().length }}</div>
                        <kbq-divider />
                    }

                    @for (action of actions; track action.id; let index = $index) {
                        @if (hiddenItemIDs.has(action.id)) {
                            @if (action.divider && hiddenItemIDs.has(actions[index - 1]?.id)) {
                                <kbq-divider />
                            }
                            <button (click)="onAction(action)" kbq-dropdown-item>
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
            overflow: hidden;
            flex-grow: 1;
        }

        .example-content {
            margin: 0 var(--kbq-size-m);
            width: 75px;
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

    onAction(action: ExampleAction): void {
        this.actionsPanelRef.close(action.id);
    }
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
            padding-bottom: var(--kbq-size-xxl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelOverviewExample {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject(ElementRef);
    private readonly exampleTable = viewChild.required(ExampleTable);
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
            width: '100%',
            data: this.data,
            overlayContainer: this.elementRef
        });

        this.actionsPanelRef.afterOpened.subscribe(() => {
            console.log('ActionsPanel opened');
        });

        this.actionsPanelRef.afterClosed.subscribe((result) => {
            console.log('ActionsPanel closed by action:', result);
            this.actionsPanelRef = null;
            this.exampleTable().reset();
        });
    }
}
