import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqActionsPanel, KbqActionsPanelRef } from '@koobiq/components/actions-panel';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';

type ExampleAction = {
    id: string;
    icon: string;
    divider?: boolean;
};

/**
 * @title Actions panel overview
 */
@Component({
    standalone: true,
    imports: [
        KbqOverflowItemsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqDividerModule
    ],
    providers: [KbqActionsPanel],
    selector: 'actions-panel-overview-example',
    template: `
        <button (click)="open(actionsPanel)" kbq-button>open</button>

        <ng-template #actionsPanel let-data>
            <div class="example-custom-content">Selected: {{ data.counter }}</div>
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
        </ng-template>
    `,
    styles: [
        `
            .example-custom-content {
                margin: 0 var(--kbq-size-m);
                flex-shrink: 0;
            }

            .example-divider-vertical {
                background-color: var(--kbq-actions-panel-vertical-divider-background-color);
                height: var(--kbq-actions-panel-vertical-divider-height) !important;
                margin: var(--kbq-actions-panel-vertical-divider-margin);
            }
        `

    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelOverviewExample {
    readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Status', icon: 'kbq-arrow-right-s_16' },
        { id: 'Verdict', icon: 'kbq-question-circle_16' },
        { id: 'Link to incident', icon: 'kbq-link_16', divider: true },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16', divider: true },
        { id: 'Remove', icon: 'kbq-trash_16' }
    ];
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    actionsPanelRef: KbqActionsPanelRef | null;
    readonly data = { counter: 0 };

    open(templateRef: TemplateRef<unknown>): void {
        this.data.counter++;
        if (this.actionsPanelRef) return;
        this.actionsPanelRef = this.actionsPanel.open(templateRef, {
            width: '844px',
            data: this.data
        });
        this.actionsPanelRef.afterClosed.subscribe(() => {
            this.actionsPanelRef = null;
            this.data.counter = 0;
        });
    }
}
