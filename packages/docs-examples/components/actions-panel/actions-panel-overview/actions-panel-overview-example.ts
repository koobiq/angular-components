import { ChangeDetectionStrategy, Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { KbqActionsPanel, KbqActionsPanelRef } from '@koobiq/components/actions-panel';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';

enum ExampleActionID {
    Responsible,
    Status,
    Verdict,
    Incident,
    Archive,
    Remove
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
    template: `
        <div class="example-custom-content">Selected: N</div>
        <kbq-divider class="example-divider-vertical" [vertical]="true" />

        <kbq-overflow-items>
            <button *kbqOverflowItem="actionID.Responsible" [color]="color.Contrast" kbq-button>
                <i kbq-icon="kbq-user_16"></i>
                Responsible
            </button>
            <button
                class="layout-margin-left-xxs"
                *kbqOverflowItem="actionID.Status"
                [color]="color.Contrast"
                kbq-button
            >
                <i kbq-icon="kbq-arrow-right-s_16"></i>
                Status
            </button>
            <button
                class="layout-margin-left-xxs"
                *kbqOverflowItem="actionID.Verdict"
                [color]="color.Contrast"
                kbq-button
            >
                <i kbq-icon="kbq-question-circle_16"></i>
                Verdict
            </button>
            <ng-container *kbqOverflowItem="actionID.Incident">
                <kbq-divider class="example-divider-vertical" [vertical]="true" />
                <button [color]="color.Contrast" kbq-button>
                    <i kbq-icon="kbq-link_16"></i>
                    Link to incident
                </button>
            </ng-container>
            <ng-container *kbqOverflowItem="actionID.Archive">
                <kbq-divider class="example-divider-vertical" [vertical]="true" />
                <button [color]="color.Contrast" [kbqDropdownTriggerFor]="archiveDropdown" kbq-button>
                    <i kbq-icon="kbq-box-archive-arrow-down_16"></i>
                    Archive
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </ng-container>
            <button
                class="layout-margin-left-xxs"
                *kbqOverflowItem="actionID.Remove"
                [color]="color.Contrast"
                kbq-button
            >
                <i kbq-icon="kbq-trash_16"></i>
                Remove
            </button>

            <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
                <button [color]="color.Contrast" [kbqDropdownTriggerFor]="dropdown" kbq-button>
                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                </button>

                <kbq-dropdown #dropdown="kbqDropdown">
                    @if (hiddenItemIDs.has(actionID.Responsible)) {
                        <button kbq-dropdown-item>
                            <i kbq-icon="kbq-user_16"></i>
                            Responsible
                        </button>
                    }
                    @if (hiddenItemIDs.has(actionID.Status)) {
                        <button kbq-dropdown-item>
                            <i kbq-icon="kbq-arrow-right-s_16"></i>
                            Status
                        </button>
                    }
                    @if (hiddenItemIDs.has(actionID.Verdict)) {
                        <button kbq-dropdown-item>
                            <i kbq-icon="kbq-question-circle_16"></i>
                            Verdict
                        </button>
                    }
                    @if (hiddenItemIDs.has(actionID.Verdict) && hiddenItemIDs.has(actionID.Incident)) {
                        <kbq-divider />
                    }
                    @if (hiddenItemIDs.has(actionID.Incident)) {
                        <button kbq-button>
                            <i kbq-icon="kbq-link_16"></i>
                            Link to incident
                        </button>
                    }
                    @if (hiddenItemIDs.has(actionID.Incident) && hiddenItemIDs.has(actionID.Archive)) {
                        <kbq-divider />
                    }
                    @if (hiddenItemIDs.has(actionID.Archive)) {
                        <button [kbqDropdownTriggerFor]="archiveDropdown" kbq-dropdown-item>
                            <i kbq-icon="kbq-box-archive-arrow-down_16"></i>
                            Archive
                        </button>
                    }
                    @if (hiddenItemIDs.has(actionID.Remove)) {
                        <button kbq-dropdown-item>
                            <i kbq-icon="kbq-trash_16"></i>
                            Remove
                        </button>
                    }
                </kbq-dropdown>
            </ng-template>
        </kbq-overflow-items>

        <kbq-divider class="example-divider-vertical" [vertical]="true" />
        <button class="layout-margin-left-xxs" [color]="color.Contrast" (click)="actionsPanelRef.close()" kbq-button>
            <i kbq-icon="kbq-xmark-circle_16"></i>
        </button>

        <kbq-dropdown #archiveDropdown="kbqDropdown">
            <button kbq-dropdown-item>
                <i kbq-icon="kbq-box-archive-arrow-down_16"></i>
                Archive
            </button>
            <button kbq-dropdown-item>
                <i kbq-icon="kbq-undo_16"></i>
                Unarchive
            </button>
        </kbq-dropdown>
    `
})
export class ActionsPanelExampleComponent implements OnDestroy {
    readonly actionID = ExampleActionID;
    readonly color = KbqComponentColors;

    readonly actionsPanelRef = inject(KbqActionsPanelRef);

    ngOnDestroy(): void {
        console.log('ActionsPanelExampleComponent destroy');
    }
}

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
    templateUrl: 'actions-panel-overview-example.html',
    styles: [
        `
            .example-custom-content {
                margin: 0 var(--kbq-size-m);
                flex-shrink: 0;
            }

            .kbq-divider.example-divider-vertical {
                background-color: var(--kbq-line-contrast-fade);
                height: var(--kbq-size-m);
                margin: 0 var(--kbq-size-s);
            }
        `

    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelOverviewExample implements OnDestroy {
    readonly actionID = ExampleActionID;
    readonly color = KbqComponentColors;

    readonly actionsPanel = inject(KbqActionsPanel);

    openFromTemplate(templateRef: TemplateRef<any>): void {
        const actionsPanelRef = this.actionsPanel.open(templateRef, {
            width: '877'
        });
        actionsPanelRef.afterOpened.subscribe(() => console.log('actionsPanel template afterOpened'));
        actionsPanelRef.afterClosed.subscribe(() => console.log('actionsPanel template afterClosed'));
    }

    openFromComponent(): void {
        const actionsPanelRef = this.actionsPanel.open(ActionsPanelExampleComponent, {
            width: '877'
        });
        actionsPanelRef.afterOpened.subscribe(() => console.log('actionsPanel component afterOpened'));
        actionsPanelRef.afterClosed.subscribe(() => console.log('actionsPanel component afterClosed'));
    }

    ngOnDestroy(): void {
        console.log('ActionsPanelOverviewExample destroy');
    }
}
