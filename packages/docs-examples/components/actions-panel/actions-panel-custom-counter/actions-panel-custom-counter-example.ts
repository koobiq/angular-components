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
        <button (click)="open()" kbq-button>open</button>

        <ng-template let-data>
            <div class="example-container">
                <div class="example-counter">
                    <div>Selected: {{ data.selected }}</div>
                    <kbq-badge [outline]="true" badgeColor="fade-contrast">+{{ data.counter }}</kbq-badge>
                </div>
                <kbq-divider class="example-divider-vertical" [vertical]="true" />
                <kbq-overflow-items>
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
                            <div class="example-counter-dropdown">
                                <div>Selected: {{ data.selected }}</div>
                                <kbq-badge badgeColor="fade-contrast">+{{ data.counter }}</kbq-badge>
                            </div>
                            <kbq-divider />

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
            </div>
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

        .example-container {
            display: flex;
            align-items: center;
            flex-grow: 1;
            container-type: inline-size;

            @container (width < 722px) {
                .example-counter,
                .example-counter + .example-divider-vertical {
                    display: none;
                }
            }
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

        .example-divider-vertical {
            background-color: var(--kbq-actions-panel-vertical-divider-background-color);
            height: var(--kbq-actions-panel-vertical-divider-height) !important;
            margin: var(--kbq-actions-panel-vertical-divider-margin);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelCustomCounterExample {
    readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Verdict', icon: 'kbq-question-circle_16' },
        { id: 'Link to incident', icon: 'kbq-link_16', divider: true },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16', divider: true },
        { id: 'Remove', icon: 'kbq-trash_16' }
    ];
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    readonly elementRef = inject(ElementRef);
    readonly templateRef = viewChild.required(TemplateRef);
    readonly toast = inject(KbqToastService);
    actionsPanelRef: KbqActionsPanelRef | null;

    constructor() {
        afterNextRender(() => this.open());
    }

    open(): void {
        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
            width: '100%',
            maxWidth: 782,
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

    onAction(action: ExampleAction): void {
        this.toast.show({ title: `Action initiated ${action.id}` });
    }
}
