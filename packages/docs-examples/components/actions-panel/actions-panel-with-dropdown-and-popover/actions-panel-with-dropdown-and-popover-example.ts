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
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { injectExampleText } from '../l10n';

/**
 * @title Actions panel with dropdown and popover
 */
@Component({
    selector: 'actions-panel-with-dropdown-and-popover-example',
    imports: [KbqButtonModule, KbqIconModule, KbqDropdownModule, KbqPopoverModule],
    template: `
        <button kbq-button (click)="open()">{{ text().open }}</button>

        <ng-template let-data>
            <button
                #popover="kbqPopover"
                color="contrast"
                kbq-button
                kbqPopover
                kbqTrigger="none"
                [kbqDropdownTriggerFor]="dropdown"
                [kbqPopoverFooter]="popoverFooter"
            >
                <i kbq-icon="kbq-shield_16"></i>
                {{ text().protection }}
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item (click)="enable(popover)">
                    <i kbq-icon="kbq-shield_16"></i>
                    {{ text().enable }}
                </button>
                <button kbq-dropdown-item (click)="disable(popover)">
                    <i kbq-icon="kbq-shield-slash_16"></i>
                    {{ text().disable }}
                </button>
            </kbq-dropdown>
        </ng-template>

        <ng-template #popoverFooter>
            <div class="example-popover-footer">
                <button kbq-button color="contrast" (click)="save()">{{ text().save }}</button>
                <button kbq-button (click)="cancel()">{{ text().cancel }}</button>
            </div>
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

        .example-popover-footer {
            display: flex;
            gap: var(--kbq-size-s);
        }
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelWithDropdownAndPopoverExample {
    protected readonly text = injectExampleText();

    private readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly templateRef = viewChild.required(TemplateRef);
    private actionsPanelRef: KbqActionsPanelRef | null;
    private popoverTriggerRef: KbqPopoverTrigger | null;

    constructor() {
        afterNextRender(() => this.open());
    }

    protected open(): void {
        if (this.actionsPanelRef) return;

        this.actionsPanelRef = this.actionsPanel.open(this.templateRef(), {
            overlayContainer: this.elementRef
        });

        this.actionsPanelRef.afterClosed.subscribe(() => (this.actionsPanelRef = null));
    }

    protected disable(popoverTriggerRef: KbqPopoverTrigger): void {
        this.popoverTriggerRef = popoverTriggerRef;
        this.popoverTriggerRef.header = this.text().disableProtectionTitle;
        this.popoverTriggerRef.show(0);
    }

    protected enable(popoverTriggerRef: KbqPopoverTrigger): void {
        this.popoverTriggerRef = popoverTriggerRef;
        this.popoverTriggerRef.header = this.text().enableProtectionTitle;
        this.popoverTriggerRef.show(0);
    }

    protected cancel(): void {
        this.popoverTriggerRef?.hide(0);
        this.popoverTriggerRef = null;
    }

    protected save(): void {
        this.popoverTriggerRef?.hide(0);
        this.popoverTriggerRef = null;
    }
}
