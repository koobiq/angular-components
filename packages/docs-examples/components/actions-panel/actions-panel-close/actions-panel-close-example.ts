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
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToastService } from '@koobiq/components/toast';

/**
 * @title Actions panel close
 */
@Component({
    standalone: true,
    imports: [
        KbqButtonModule,
        KbqIconModule,
        KbqDividerModule
    ],
    providers: [KbqActionsPanel],
    selector: 'actions-panel-close-example',
    template: `
        <button (click)="open()" kbq-button>open</button>

        <ng-template let-data>
            <div class="example-content">Selected: {{ data.length }}</div>
            <kbq-divider class="example-divider-vertical" [vertical]="true" />
            <button (click)="onAction('Execute and close')" color="contrast" kbq-button>
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

        .example-content {
            display: flex;
            align-items: center;
            margin: 0 var(--kbq-size-m);
            user-select: none;
            white-space: nowrap;
        }

        .example-divider-vertical {
            background-color: var(--kbq-actions-panel-vertical-divider-background-color);
            height: var(--kbq-actions-panel-vertical-divider-height) !important;
            margin: var(--kbq-actions-panel-vertical-divider-margin);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelCloseExample {
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    readonly elementRef = inject(ElementRef);
    readonly templateRef = viewChild.required(TemplateRef);
    readonly toast = inject(KbqToastService);
    actionsPanelRef: KbqActionsPanelRef | null;

    constructor() {
        afterNextRender(() => this.open());
    }

    open(): void {
        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
            width: '332px',
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

    onAction(action: string): void {
        this.toast.show({ title: `Action initiated ${action}` });
        this.actionsPanelRef?.close();
    }
}
