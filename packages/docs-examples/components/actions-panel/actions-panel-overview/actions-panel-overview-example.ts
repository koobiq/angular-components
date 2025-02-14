import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';
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
                background-color: var(--kbq-actions-panel-vertical-divider-background-color);
                height: var(--kbq-actions-panel-vertical-divider-height);
                margin: var(--kbq-actions-panel-vertical-divider-margin);
            }
        `

    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelOverviewExample {
    readonly actionID = ExampleActionID;
    readonly color = KbqComponentColors;

    readonly actionsPanel = inject(KbqActionsPanel, { self: true });

    open(templateRef: TemplateRef<unknown>): void {
        const actionsPanelRef = this.actionsPanel.open(templateRef, {
            width: '877px'
        });
        actionsPanelRef.afterOpened.subscribe(() => console.log('actionsPanel afterOpened'));
        actionsPanelRef.afterClosed.subscribe(() => console.log('actionsPanel afterClosed'));
    }
}
