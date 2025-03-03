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
    selector: 'example-actions-panel',
    template: `
        <button (click)="open()" kbq-button>open</button>

        <ng-template let-data>
            <kbq-overflow-items>
                <ng-container *kbqOverflowItem="'content'">
                    <div class="example-content">Selected: {{ data.length }}</div>
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
                            <div class="example-content">Selected: {{ data.length }}</div>
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
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 64px;
            resize: horizontal;
            max-width: 100%;
            min-width: 110px;
            overflow: hidden;
        }

        .example-content {
            margin: 0 var(--kbq-size-m);
            width: 75px;
            user-select: none;
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
    readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Status', icon: 'kbq-arrow-right-s_16' },
        { id: 'Verdict', icon: 'kbq-question-circle_16' },
        { id: 'Link to incident', icon: 'kbq-link_16', divider: true },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16', divider: true },
        { id: 'Remove', icon: 'kbq-trash_16' }
    ];
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    readonly elementRef = inject(ElementRef);
    readonly templateRef = viewChild.required(TemplateRef);
    actionsPanelRef: KbqActionsPanelRef | null;
    readonly toast = inject(KbqToastService);

    constructor() {
        afterNextRender(() => this.open());
    }

    open(): void {
        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
            width: '100%',
            data: { length: 5 },
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

/**
 * @title Actions panel adaptive
 */
@Component({
    standalone: true,
    imports: [ExampleActionsPanel],
    selector: 'actions-panel-adaptive-example',
    template: `
        <div>At first, the actions are hidden under the dropdown menu</div>
        <example-actions-panel [style.width.px]="527" />

        <div>Then hides the number of records</div>
        <example-actions-panel [style.width.px]="234" />

        <div>Everything is hidden under the dropdown menu</div>
        <example-actions-panel [style.width.px]="110" />
    `,
    styles: `
        div {
            color: var(--kbq-foreground-contrast-secondary);
            margin: var(--kbq-size-s) var(--kbq-size-s) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelAdaptiveExample {}
