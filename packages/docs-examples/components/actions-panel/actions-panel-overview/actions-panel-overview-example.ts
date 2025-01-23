import { afterNextRender, ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
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
export class ActionsPanelOverviewExample {
    readonly actionID = ExampleActionID;
    readonly color = KbqComponentColors;

    readonly actionsPanel = inject(KbqActionsPanel);
    readonly template = viewChild.required(TemplateRef);

    constructor() {
        afterNextRender(() => {
            this.open(this.template());
        });
    }

    open(templateRef: TemplateRef<any>): void {
        const actionsPanelRef = this.actionsPanel.openFromTemplate(templateRef, {
            width: 877
        });
        actionsPanelRef.closed.subscribe(() => console.log('actionsPanel closed'));
    }
}
