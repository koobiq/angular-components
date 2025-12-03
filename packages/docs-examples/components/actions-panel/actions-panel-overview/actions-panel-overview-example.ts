import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    output,
    Signal,
    signal,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
    selector: 'example-table',
    imports: [
        KbqTableModule,
        KbqCheckboxModule,
        FormsModule
    ],
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
    protected readonly data: ExampleTableItem[] = Array.from({ length: 4 })
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

    protected change(): void {
        this.selectedItems.emit(this.data.filter(({ selected }) => selected));
    }
}

@Component({
    selector: 'example-actions-panel',
    imports: [
        KbqOverflowItemsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqDividerModule
    ],
    template: `
        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
            <div order="99" [kbqOverflowItem]="action.Counter">
                <div class="example-counter">Selected: {{ data().length }}</div>
                <kbq-divider class="example-divider-vertical" [vertical]="true" />
            </div>

            @for (action of actions; track action.id) {
                <div [kbqOverflowItem]="action.id">
                    @if (action.divider) {
                        <kbq-divider class="example-divider-vertical" [vertical]="true" />
                    }
                    <button
                        color="contrast"
                        kbq-button
                        [class.layout-margin-left-xxs]="!$first"
                        (click)="onAction(action)"
                    >
                        <i kbq-icon [class]="action.icon"></i>
                        {{ action.id }}
                    </button>
                </div>
            }

            @let hiddenItemIDs = kbqOverflowItems.hiddenItemIDs();
            <!-- ignores when only action.Counter is hidden -->
            @if (hiddenItemIDs.size > 1) {
                <button kbqOverflowItemsResult color="contrast" kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                </button>
            }

            <kbq-dropdown #dropdown="kbqDropdown">
                <div class="example-counter-dropdown">Selected: {{ data().length }}</div>
                <kbq-divider />

                @for (action of actions; track action.id) {
                    @if (hiddenItemIDs.has(action.id)) {
                        @if (action.divider && hiddenItemIDs.has(actions[$index - 1].id)) {
                            <kbq-divider />
                        }
                        <button kbq-dropdown-item (click)="onAction(action)">
                            <i kbq-icon [class]="action.icon"></i>
                            {{ action.id }}
                        </button>
                    }
                }
            </kbq-dropdown>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            overflow: hidden;
            flex-grow: 1;
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

        .kbq-overflow-item {
            display: flex;
            align-items: center;
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
    protected readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Link to incident', icon: 'kbq-link_16' },
        { id: 'Remove', icon: 'kbq-trash_16', divider: true }
    ];
    protected readonly action = { Counter: 'counter' };

    protected readonly data = inject<Signal<ExampleTableItem[]>>(KBQ_ACTIONS_PANEL_DATA);
    protected readonly actionsPanelRef = inject(KbqActionsPanelRef);
    private readonly toast = inject(KbqToastService);

    protected onAction(action: ExampleAction): void {
        this.toast.show({ title: `Action initiated ${action.id}` });
    }
}

/**
 * @title Actions panel overview
 */
@Component({
    selector: 'actions-panel-overview-example',
    imports: [ExampleTable],
    template: `
        <example-table (selectedItems)="toggleActionsPanel($event)" />
    `,
    styles: `
        :host {
            display: flex;
            overflow: hidden;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [KbqActionsPanel]
})
export class ActionsPanelOverviewExample {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly exampleTable = viewChild.required(ExampleTable);
    private actionsPanelRef: KbqActionsPanelRef<ExampleActionsPanel> | null;
    private readonly data = signal<ExampleTableItem[]>([]);
    private readonly destroyRef = inject(DestroyRef);

    protected toggleActionsPanel(selectedItems: ExampleTableItem[]): void {
        if (selectedItems.length === 0) return this.actionsPanel.close();

        this.data.set(selectedItems);

        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(ExampleActionsPanel, {
            data: this.data,
            overlayContainer: this.elementRef
        });

        this.actionsPanelRef.afterOpened.subscribe(() => {
            console.log('ActionsPanel opened');
        });

        this.actionsPanelRef.afterClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
            console.log('ActionsPanel closed by action:', result);

            this.actionsPanelRef = null;
            this.exampleTable().reset();
        });
    }
}
