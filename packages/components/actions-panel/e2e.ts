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
                    aria-label="More"
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
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush,
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

@Component({
    selector: 'e2e-actions-panel-global-overlay-container',
    imports: [KbqButtonModule],
    template: `
        <button data-testid="e2eActionsPanelGlobalOpenButton" kbq-button (click)="open()">Open</button>

        <ng-template>
            <button color="contrast" kbq-button>Action</button>
        </ng-template>
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eActionsPanelGlobalOverlayContainer'
    }
})
export class E2eActionsPanelGlobalOverlayContainer {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly templateRef = viewChild.required(TemplateRef);

    protected open(): void {
        // No `overlayContainer`: the panel belongs to the application-wide overlay container.
        this.actionsPanel.open(this.templateRef());
    }
}

@Component({
    selector: 'e2e-actions-panel-disabled-buttons',
    imports: [KbqButtonModule],
    template: `
        <button data-testid="e2eActionsPanelDisabledOpenButton" kbq-button (click)="open()">Open</button>

        <ng-template>
            <button color="contrast" kbq-button data-testid="e2eFilledContrastEnabled">Filled</button>
            <button color="contrast" kbq-button data-testid="e2eFilledContrastDisabled" [disabled]="true">
                Filled
            </button>
            <button kbqStyle="outline" kbq-button data-testid="e2eOutlineEnabled">Outline</button>
            <button kbqStyle="outline" kbq-button data-testid="e2eOutlineDisabled" [disabled]="true">Outline</button>
            <button kbqStyle="transparent" color="contrast" kbq-button data-testid="e2eTransparentEnabled">
                Transparent
            </button>
            <button
                kbqStyle="transparent"
                color="contrast"
                kbq-button
                data-testid="e2eTransparentDisabled"
                [disabled]="true"
            >
                Transparent
            </button>
            <button kbqStyle="transparent" color="theme" kbq-button data-testid="e2eThemeDisabled" [disabled]="true">
                Theme
            </button>
        </ng-template>
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eActionsPanelDisabledButtons'
    }
})
export class E2eActionsPanelDisabledButtons {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly templateRef = viewChild.required(TemplateRef);

    protected open(): void {
        this.actionsPanel.open(this.templateRef());
    }
}

@Component({
    selector: 'e2e-actions-panel-disabled-overflow',
    imports: [KbqButtonModule, KbqIconModule, KbqOverflowItemsModule, KbqDropdownModule],
    template: `
        <button data-testid="e2eActionsPanelDisabledOverflowOpenButton" kbq-button (click)="open()">Open</button>

        <div #overlayContainer data-testid="e2eScreenshotTarget" class="e2e-disabled-overflow-overlay-container"></div>

        <ng-template>
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
                        [disabled]="$index === disabledAction"
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
                    aria-label="More"
                    data-testid="e2eActionsPanelDisabledOverflowResultButton"
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
        .e2e-disabled-overflow-overlay-container {
            border: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
            display: block;
            height: 200px;
            width: 400px;
            resize: horizontal;
            overflow: hidden;
            margin: 0 auto; /* required for test */
        }
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eActionsPanelDisabledOverflow'
    }
})
export class E2eActionsPanelDisabledOverflow {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly templateRef = viewChild.required(TemplateRef);
    private readonly overlayContainer = viewChild.required('overlayContainer', { read: ElementRef });
    protected readonly actions = Array.from({ length: 7 });
    protected readonly disabledAction = 2;

    protected open(): void {
        this.actionsPanel.open(this.templateRef(), { overlayContainer: this.overlayContainer() });
    }
}
