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

/**
 * @title Actions panel overview
 */
@Component({
    selector: 'actions-panel-overview-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="open()">open</button>

        <ng-template>
            <button color="contrast" kbq-button (click)="action('Action1')">Action 1</button>
            <button color="contrast" kbq-button class="layout-margin-left-xxs" (click)="action('Action2')">
                Action 2
            </button>
            <button color="contrast" kbq-button class="layout-margin-left-xxs" (click)="action('Action3')">
                Action 3
            </button>
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
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelOverviewExample {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly templateRef = viewChild.required(TemplateRef);
    private actionsPanelRef?: KbqActionsPanelRef | null;

    constructor() {
        afterNextRender(() => this.open());
    }

    protected action(action: string): void {
        this.actionsPanelRef?.close(action);
    }

    protected open(): void {
        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
            overlayContainer: this.elementRef
        });

        this.actionsPanelRef.beforeOpened.subscribe(() => {
            console.log('before actions-panel opened');
        });

        this.actionsPanelRef.afterOpened.subscribe(() => {
            console.log('after actions-panel opened');
        });

        this.actionsPanelRef.beforeClosed.subscribe((result) => {
            console.log('before actions-panel closed', result);
        });

        this.actionsPanelRef.afterClosed.subscribe((result) => {
            console.log('after actions-panel closed', result);
            this.actionsPanelRef = null;
        });
    }
}
