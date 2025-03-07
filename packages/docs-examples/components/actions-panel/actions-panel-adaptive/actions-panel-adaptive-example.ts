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
            <div class="example-counter">Selected: {{ data.length }}</div>
            <kbq-divider class="example-divider-vertical" [vertical]="true" />
            <kbq-overflow-items>
                @for (action of actions; track action.id; let first = $first) {
                    <button
                        *kbqOverflowItem="action.id"
                        [class.layout-margin-left-xxs]="!first"
                        (click)="onAction(action)"
                        color="contrast"
                        kbq-button
                    >
                        <i [class]="action.icon" kbq-icon></i>
                        {{ action.id }}
                    </button>
                }
                <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
                    <button [kbqDropdownTriggerFor]="dropdown" color="contrast" kbq-button>
                        <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                    </button>

                    <kbq-dropdown #dropdown="kbqDropdown">
                        <div class="example-counter-dropdown">Selected: {{ data.length }}</div>
                        <kbq-divider />

                        @for (action of actions; track action.id; let index = $index) {
                            @if (hiddenItemIDs.has(action.id)) {
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
            container-type: inline-size;

            @container (width < 498px) {
                .example-counter,
                .example-counter + .example-divider-vertical {
                    display: none;
                }
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
    readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Status', icon: 'kbq-arrow-right-s_16' },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16' }
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
            maxWidth: 498,
            minWidth: 106,
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
        <div>First, the number of records is hidden</div>
        <example-actions-panel [style.width.px]="395" />

        <div>Then, the actions are hidden under the dropdown menu</div>
        <example-actions-panel [style.width.px]="329" />

        <div>Everything is hidden under the dropdown menu</div>
        <example-actions-panel [style.width.px]="106" />
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
