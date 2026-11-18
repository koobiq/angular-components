import { ChangeDetectionStrategy, Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCloseReason } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelModule, KbqSidepanelRef, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRANSLATIONS } from './l10n';

/**
 * @title Sidepanel with a close guard
 */
@Component({
    selector: 'sidepanel-can-close-example',
    imports: [KbqButtonModule, KbqSidepanelModule, KbqFormFieldModule, KbqInputModule, FormsModule],
    template: `
        <button kbq-button (click)="openSidepanel()">{{ t().open }}</button>

        <ng-template>
            <kbq-sidepanel-header [closeable]="true">{{ t().title }}</kbq-sidepanel-header>
            <kbq-sidepanel-body style="padding-top: 8px">
                <kbq-form-field>
                    <input kbqInput [placeholder]="t().name" [(ngModel)]="value" (ngModelChange)="dirty.set(true)" />
                </kbq-form-field>
            </kbq-sidepanel-body>
            <kbq-sidepanel-footer>
                <kbq-sidepanel-actions>
                    <button kbq-button color="contrast" (click)="save()">
                        <span>{{ t().save }}</span>
                    </button>
                </kbq-sidepanel-actions>
            </kbq-sidepanel-footer>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelCanCloseExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly sidepanelService = inject(KbqSidepanelService);
    private readonly modalService = inject(KbqModalService);

    private readonly template = viewChild.required(TemplateRef);

    private sidepanelRef: KbqSidepanelRef | null = null;

    value = '';
    readonly dirty = signal(false);

    openSidepanel(): void {
        this.dirty.set(false);

        this.sidepanelRef = this.sidepanelService.open(this.template(), {
            canClose: (reason) => this.canClose(reason)
        });
    }

    /** Successful save: the programmatic close passes the guard without a confirmation. */
    save(): void {
        this.dirty.set(false);
        this.sidepanelRef?.close();
    }

    private canClose(reason: KbqCloseReason): boolean | Observable<boolean> {
        if (reason === 'programmatic' || !this.dirty()) return true;

        return this.modalService
            .confirm({
                kbqTitle: this.t().confirmTitle,
                kbqContent: this.t().confirmContent,
                kbqOkText: this.t().discard,
                kbqCancelText: this.t().keepEditing,
                kbqOkClick: () => 'ok'
            })
            .afterClose.pipe(map((result) => result === 'ok'));
    }
}
