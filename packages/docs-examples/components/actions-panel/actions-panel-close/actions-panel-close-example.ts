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
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Actions panel close
 */
@Component({
    selector: 'actions-panel-close-example',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button (click)="open()">{{ t().open }}</button>

        <ng-template let-data>
            <button color="contrast" kbq-button (click)="onAction(t().executeAndClose)">
                <i kbq-icon="kbq-user_16"></i>
                {{ t().executeAndClose }}
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
export class ActionsPanelCloseExample extends BaseLocalizedExample<ExampleTranslation> {
    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly templateRef = viewChild.required(TemplateRef);
    private readonly toast = inject(KbqToastService);
    private actionsPanelRef: KbqActionsPanelRef | null;

    constructor() {
        super(TRANSLATIONS);
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
        this.toast.show({ title: this.t().actionInitiated(action) });
        this.actionsPanelRef?.close();
    }
}
