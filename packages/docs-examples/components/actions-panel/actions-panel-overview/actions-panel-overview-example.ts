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
import { KbqToastService } from '@koobiq/components/toast';

type ExampleAction = {
    id: string;
    icon: string;
    divider?: boolean;
};

type ExampleTableItem = {
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
                @for (item of data; track item) {
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
            padding-bottom: 80px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTable {
    readonly data: ExampleTableItem[] = Array.from({ length: 4 })
        .map((_, index) => [
            {
                threat: 'DDoS attacks',
                description: 'Overloading the system with requests to make it unavailable',
                protectionMeasures: 'Using protective systems (e.g., CDN), traffic monitoring',
                selected: index === 0
            },
            {
                threat: 'Brute force attacks',
                description: 'Password guessing to gain access to systems',
                protectionMeasures: 'Using complex passwords and two-factor authentication',
                selected: index === 0
            },
            {
                threat: 'Fake Wi-Fi networks',
                description: 'Creating fake access points to intercept data',
                protectionMeasures: 'Using VPN, disabling automatic Wi-Fi connections',
                selected: index === 0
            },
            {
                threat: 'Supply chain attacks',
                description: 'Injecting malicious code through third-party components',
                protectionMeasures: 'Verifying third-party suppliers, using trusted sources',
                selected: false
            }
        ])
        .flat();

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
        <div class="example-counter">Selected: {{ data().length }}</div>
        <kbq-divider class="example-divider-vertical" [vertical]="true" />
        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
            @for (action of actions; track action.id) {
                <div class="example-action-container" [kbqOverflowItem]="action.id">
                    @if (action.divider) {
                        <kbq-divider class="example-divider-vertical" [vertical]="true" />
                    }
                    <button
                        [class.layout-margin-left-xxs]="!$first"
                        (click)="onAction(action)"
                        color="contrast"
                        kbq-button
                    >
                        <i [class]="action.icon" kbq-icon></i>
                        {{ action.id }}
                    </button>
                </div>
            }
            <div kbqOverflowItemsResult>
                <button [kbqDropdownTriggerFor]="dropdown" color="contrast" kbq-button>
                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                </button>

                <kbq-dropdown #dropdown="kbqDropdown">
                    <div class="example-counter-dropdown">Selected: {{ data().length }}</div>
                    <kbq-divider />

                    @let hiddenItemIDs = kbqOverflowItems.hiddenItemIDs();

                    @for (action of actions; track action.id) {
                        @if (hiddenItemIDs.has(action.id)) {
                            @if (action.divider && hiddenItemIDs.has(actions[$index - 1]?.id)) {
                                <kbq-divider />
                            }
                            <button (click)="onAction(action)" kbq-dropdown-item>
                                <i [class]="action.icon" kbq-icon></i>
                                {{ action.id }}
                            </button>
                        }
                    }
                </kbq-dropdown>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            overflow: hidden;
            flex-grow: 1;
            container-type: inline-size;
        }

        @container (width < 495px) {
            .example-counter,
            .example-counter + .example-divider-vertical {
                display: none;
            }
        }

        .example-counter {
            margin: 0 var(--kbq-size-m);
            width: 75px;
        }

        .example-counter,
        .example-counter-dropdown {
            user-select: none;
            white-space: nowrap;
        }

        .example-counter-dropdown {
            font-weight: var(--kbq-typography-text-normal-strong-font-weight);
            margin: var(--kbq-size-s) var(--kbq-size-m);
        }

        .example-action-container {
            display: flex;
            align-items: center;
        }

        .example-divider-vertical {
            background-color: var(--kbq-actions-panel-vertical-divider-background-color);
            height: var(--kbq-actions-panel-vertical-divider-height) !important;
            margin: var(--kbq-actions-panel-vertical-divider-margin);
        }

        .kbq-button,
        .kbq-dropdown-trigger {
            margin: var(--kbq-size-border-width);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleActionsPanel {
    readonly data = inject<Signal<ExampleTableItem[]>>(KBQ_ACTIONS_PANEL_DATA);
    readonly actionsPanelRef = inject(KbqActionsPanelRef);
    readonly toast = inject(KbqToastService);

    readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Link to incident', icon: 'kbq-link_16' },
        { id: 'Remove', icon: 'kbq-trash_16', divider: true }
    ];

    onAction(action: ExampleAction): void {
        this.toast.show({ title: `Action initiated ${action.id}` });
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
            overflow: hidden;
        }

        ::ng-deep .docs-live-example__example:has(actions-panel-overview-example) {
            padding: 0;
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
            minWidth: 106,
            maxWidth: 568,
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
