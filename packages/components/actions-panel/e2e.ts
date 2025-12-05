import { ChangeDetectionStrategy, Component, ElementRef, inject, TemplateRef, viewChild } from '@angular/core';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';

@Component({
    selector: 'e2e-actions-panel-with-overlay-container',
    imports: [KbqButtonModule, KbqIconModule, KbqOverflowItemsModule, KbqDropdownModule],
    template: `
        <button data-testid="e2eActionsPanelOpenButton" kbq-button (click)="open()">Open</button>

        <div #overlayContainer data-testid="e2eActionsPanelOverlayContainer" class="dev-overlay-container"></div>

        <ng-template let-data>
            <div
                #kbqOverflowItems="kbqOverflowItems"
                kbqOverflowItems
                [additionalResizeObserverTargets]="overlayContainer"
            >
                @for (action of actions; track $index) {
                    <button
                        color="contrast"
                        kbq-button
                        [kbqOverflowItem]="$index"
                        [class.layout-margin-left-xxs]="!$first"
                    >
                        <i kbq-icon="kbq-user_16"></i>
                        Action {{ $index }}
                    </button>
                }

                @let hiddenItemIDs = kbqOverflowItems.hiddenItemIDs();

                <button
                    kbqOverflowItemsResult
                    color="contrast"
                    kbq-button
                    data-testid="e2eActionsPanelOverflowItemsResultButton"
                    [kbqDropdownTriggerFor]="dropdown"
                >
                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                </button>

                <kbq-dropdown #dropdown="kbqDropdown">
                    @for (action of actions; track $index) {
                        @if (hiddenItemIDs.has($index)) {
                            <button kbq-dropdown-item>
                                <i kbq-icon="kbq-user_16"></i>
                                Action {{ $index }}
                            </button>
                        }
                    }
                </kbq-dropdown>
            </div>
        </ng-template>
    `,
    styles: `
        .dev-overlay-container {
            border: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
            display: block;
            height: 200px;
            width: 400px;
            resize: horizontal;
            overflow: hidden;
            margin: 0 auto; /* required for test */
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [KbqActionsPanel],
    host: {
        'data-testid': 'e2eActionsPanelWithOverlayContainer'
    }
})
export class E2eActionsPanelWithOverlayContainer {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly templateRef = viewChild.required(TemplateRef);
    private readonly overlayContainer = viewChild.required('overlayContainer', { read: ElementRef });
    protected readonly actions = Array.from({ length: 7 });

    protected open(): void {
        this.actionsPanel.open(this.templateRef(), {
            data: {},
            overlayContainer: this.overlayContainer()
        });
    }
}
