import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { KbqActionsPanel, KbqActionsPanelRef } from '@koobiq/components/actions-panel';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectExampleText } from '../l10n';

/**
 * @title Actions panel opened globally
 */
@Component({
    selector: 'actions-panel-global-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="open()">{{ text().open }}</button>

        <ng-template>
            <button color="contrast" kbq-button (click)="action('Action1')">{{ text().action1 }}</button>
            <button color="contrast" kbq-button class="layout-margin-left-xxs" (click)="action('Action2')">
                {{ text().action2 }}
            </button>
            <button color="contrast" kbq-button class="layout-margin-left-xxs" (click)="action('Action3')">
                {{ text().action3 }}
            </button>
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 64px;
        }
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelGlobalExample {
    protected readonly text = injectExampleText();

    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly templateRef = viewChild.required(TemplateRef);
    private actionsPanelRef?: KbqActionsPanelRef | null;

    protected action(action: string): void {
        this.actionsPanelRef?.close(action);
    }

    protected open(): void {
        if (this.actionsPanelRef) return;

        // No `overlayContainer`: the panel goes into the application-wide overlay container and is pinned to the
        // bottom of the viewport, above the page, the way a dialog is.
        this.actionsPanelRef = this.actionsPanel.open(this.templateRef());

        this.actionsPanelRef.afterClosed.subscribe(() => (this.actionsPanelRef = null));
    }
}
