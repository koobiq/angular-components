import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    TemplateRef,
    viewChild
} from '@angular/core';
import { KbqActionsPanel, KbqActionsPanelRef } from '@koobiq/components/actions-panel';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToastService } from '@koobiq/components/toast';

type ExampleAction = {
    id: string;
    icon: string;
    divider?: boolean;
};

/**
 * @title Actions panel custom counter
 */
@Component({
    standalone: true,
    imports: [
        KbqOverflowItemsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqDividerModule,
        KbqBadgeModule
    ],
    providers: [KbqActionsPanel],
    selector: 'actions-panel-custom-counter-example',
    template: `
        <button kbq-button (click)="open()">open</button>

        <ng-template let-data>
            <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                <div order="99" [kbqOverflowItem]="action.Counter">
                    <div class="example-counter">
                        <div>Selected: {{ data.selected }}</div>
                        <kbq-badge badgeColor="fade-contrast" [outline]="true">+{{ data.counter }}</kbq-badge>
                    </div>
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
            </div>

            @let hiddenItemIDs = kbqOverflowItems.hiddenItemIDs();
            <!-- ignores when only action.Counter is hidden -->
            @if (hiddenItemIDs.size > 1) {
                <button kbqOverflowItemsResult color="contrast" kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                </button>
            }

            <kbq-dropdown #dropdown="kbqDropdown">
                <div class="example-counter-dropdown">
                    <div>Selected: {{ data.selected }}</div>
                    <kbq-badge badgeColor="fade-contrast">+{{ data.counter }}</kbq-badge>
                </div>
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
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 64px;
            overflow: hidden;
        }

        .example-counter {
            margin: 0 var(--kbq-size-m);
        }

        .example-counter .kbq-badge {
            color: inherit;
            padding: 0 var(--kbq-size-xxs);
            font-size: var(--kbq-typography-text-compact-font-size);
            height: var(--kbq-size-l);
            margin-left: var(--kbq-size-xxs);
        }

        .example-counter,
        .example-counter-dropdown {
            display: flex;
            align-items: center;
            user-select: none;
            white-space: nowrap;
        }

        .example-counter-dropdown {
            font-weight: var(--kbq-typography-text-normal-strong-font-weight);
            margin: var(--kbq-size-s) var(--kbq-size-m);
        }

        .example-counter-dropdown .kbq-badge {
            color: inherit;
            padding: 0 var(--kbq-size-xxs);
            font-size: var(--kbq-typography-text-compact-font-size);
            height: var(--kbq-size-l);
            margin-left: var(--kbq-size-xxs);
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
export class ActionsPanelCustomCounterExample {
    protected readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Link to incident', icon: 'kbq-link_16' },
        { id: 'Remove', icon: 'kbq-trash_16', divider: true }
    ];
    protected readonly action = { Counter: 'counter' };

    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly templateRef = viewChild.required(TemplateRef);
    private readonly toast = inject(KbqToastService);
    private actionsPanelRef: KbqActionsPanelRef | null;

    constructor() {
        afterNextRender(() => this.open());
    }

    protected open(): void {
        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
            data: { selected: 3, counter: 6 },
            overlayContainer: this.elementRef
        });

        this.actionsPanelRef.afterOpened.subscribe(() => {
            console.log('ActionsPanel opened');
        });

        this.actionsPanelRef.afterClosed.subscribe((result) => {
            console.log('ActionsPanel closed by action:', result);
            this.actionsPanelRef = null;
        });
    }

    protected onAction(action: ExampleAction): void {
        this.toast.show({ title: `Action initiated ${action.id}` });
    }
}
