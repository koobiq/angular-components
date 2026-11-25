import { ChangeDetectionStrategy, Component, effect, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Observable } from 'rxjs';
import { map, take } from 'rxjs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_WINDOW, type KbqCloseReason } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelModule, type KbqSidepanelRef, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Sidepanel with a close guard
 */
@Component({
    selector: 'sidepanel-can-close-example',
    imports: [KbqButtonModule, KbqSidepanelModule, KbqFormFieldModule, KbqInputModule, FormsModule],
    template: `
        <button kbq-button type="button" (click)="openSidepanel()">{{ t().open }}</button>

        <ng-template>
            <kbq-sidepanel-header [closeable]="true">{{ t().title }}</kbq-sidepanel-header>
            <kbq-sidepanel-body style="padding-top: 8px">
                <kbq-form-field>
                    <input
                        id="can-close-name"
                        kbqInput
                        [placeholder]="t().name"
                        [(ngModel)]="value"
                        (ngModelChange)="dirty.set(true)"
                    />
                </kbq-form-field>
            </kbq-sidepanel-body>
            <kbq-sidepanel-footer>
                <kbq-sidepanel-actions>
                    <button kbq-button type="button" color="contrast" (click)="save()">
                        <span>{{ t().save }}</span>
                    </button>
                    <button kbq-button type="button" (click)="cancel()">
                        <span>{{ t().cancel }}</span>
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
    private readonly window = inject(KBQ_WINDOW);

    private readonly template = viewChild.required(TemplateRef);

    private sidepanelRef: KbqSidepanelRef | null = null;

    value = '';
    readonly dirty = signal(false);

    constructor() {
        // Leaving the tab cannot show a Koobiq dialog: the browser shows its own confirmation
        // while the form is dirty. The text is up to the browser and cannot be changed.
        effect((onCleanup) => {
            if (!this.dirty()) return;

            const warnOnUnload = (event: BeforeUnloadEvent) => event.preventDefault();

            this.window.addEventListener('beforeunload', warnOnUnload);
            onCleanup(() => this.window.removeEventListener('beforeunload', warnOnUnload));
        });
    }

    openSidepanel(): void {
        this.dirty.set(false);

        this.sidepanelRef = this.sidepanelService.open(this.template(), {
            canClose: (reason) => this.canClose(reason)
        });

        // The trap captures focus into the panel, but lands it on the header close button: move it
        // into the field the panel was opened for.
        this.sidepanelRef
            .afterOpened()
            .pipe(take(1))
            .subscribe(() => {
                this.window.document.getElementById('can-close-name')?.focus();
            });
    }

    /** Successful save: the programmatic close passes the guard without a confirmation. */
    save(): void {
        this.dirty.set(false);
        this.sidepanelRef?.close();
    }

    /** Cancel is an explicit discard: it closes without the confirmation, like Save. */
    cancel(): void {
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
