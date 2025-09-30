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
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToastService } from '@koobiq/components/toast';

/**
 * @title Actions panel close
 */
@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqIconModule],
    providers: [KbqActionsPanel],
    selector: 'actions-panel-close-example',
    template: `
        <button kbq-button (click)="open()">open</button>

        <ng-template let-data>
            <button color="contrast" kbq-button (click)="onAction('Execute and close')">
                <i kbq-icon="kbq-user_16"></i>
                Execute and close
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelCloseExample {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly templateRef = viewChild.required(TemplateRef);
    private readonly toast = inject(KbqToastService);
    private actionsPanelRef: KbqActionsPanelRef | null;

    constructor() {
        afterNextRender(() => this.open());
    }

    protected open(): void {
        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
            data: { length: 3 },
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

    protected onAction(action: string): void {
        this.toast.show({ title: `Action initiated ${action}` });
        this.actionsPanelRef?.close();
    }
}
