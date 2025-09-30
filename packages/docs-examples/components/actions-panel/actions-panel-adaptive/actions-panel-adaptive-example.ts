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
        <button kbq-button (click)="open()">open</button>

        <ng-template let-data>
            <div
                #kbqOverflowItems="kbqOverflowItems"
                kbqOverflowItems
                [additionalResizeObserverTargets]="additionalResizeObserverTargets"
            >
                <div order="99" [kbqOverflowItem]="action.Counter">
                    <div class="example-counter">Selected: {{ data.length }}</div>
                    <kbq-divider class="example-divider-vertical" [vertical]="true" />
                </div>

                @for (action of actions; track action.id) {
                    <button
                        color="contrast"
                        kbq-button
                        [kbqOverflowItem]="action.id"
                        [class.layout-margin-left-xxs]="!$first"
                        (click)="onAction(action)"
                    >
                        <i kbq-icon [class]="action.icon"></i>
                        {{ action.id }}
                    </button>
                }

                @let hiddenItemIDs = kbqOverflowItems.hiddenItemIDs();
                <!-- ignores when only action.Counter is hidden -->
                @if (hiddenItemIDs.size > 1) {
                    <button kbqOverflowItemsResult color="contrast" kbq-button [kbqDropdownTriggerFor]="dropdown">
                        <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                    </button>
                }

                <kbq-dropdown #dropdown="kbqDropdown">
                    <div class="example-counter-dropdown">Selected: {{ data.length }}</div>
                    <kbq-divider />

                    @for (action of actions; track action.id) {
                        @if (hiddenItemIDs.has(action.id)) {
                            <button kbq-dropdown-item (click)="onAction(action)">
                                <i kbq-icon [class]="action.icon"></i>
                                {{ action.id }}
                            </button>
                        }
                    }
                </kbq-dropdown>
            </div>
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 64px;
        }

        .kbq-overflow-item {
            display: flex;
            align-items: center;
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleActionsPanel {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly templateRef = viewChild.required(TemplateRef);
    private actionsPanelRef: KbqActionsPanelRef | null;
    private readonly toast = inject(KbqToastService);

    protected readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Status', icon: 'kbq-arrow-right-s_16' },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16' }
    ];
    protected readonly action = { Counter: 'counter' };
    protected readonly additionalResizeObserverTargets = this.elementRef.nativeElement;

    constructor() {
        afterNextRender(() => this.open());
    }

    protected open(): void {
        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
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

    protected onAction(action: ExampleAction): void {
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
        <example-actions-panel [style.width.px]="377" />

        <div>Then, the actions are hidden under the dropdown menu</div>
        <example-actions-panel [style.width.px]="308" />

        <div>Everything is hidden under the dropdown menu</div>
        <example-actions-panel [style.width.px]="89" />
    `,
    styles: `
        div {
            color: var(--kbq-foreground-contrast-secondary);
            margin: var(--kbq-size-s) var(--kbq-size-s) 0;
        }

        example-actions-panel {
            min-width: 89px;
            max-width: 100%;
            overflow: hidden;
            resize: horizontal;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelAdaptiveExample {}
