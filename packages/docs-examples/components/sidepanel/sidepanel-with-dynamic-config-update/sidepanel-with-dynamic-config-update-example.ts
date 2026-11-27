import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_SIDEPANEL_DATA,
    KbqSidepanelModule,
    KbqSidepanelRef,
    KbqSidepanelService
} from '@koobiq/components/sidepanel';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

type ExampleComponentData = {
    open: () => void;
};

@Component({
    selector: 'example-sidepanel-component',
    imports: [KbqSidepanelModule, KbqButtonModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">{{ t().header }}</kbq-sidepanel-header>
        <kbq-sidepanel-body>
            <kbq-toggle [(ngModel)]="disableClose">{{ t().disableClose }}</kbq-toggle>
        </kbq-sidepanel-body>
        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button color="contrast" type="button" (click)="open()">
                    <span>{{ t().openAnother }}</span>
                </button>

                <button kbq-button kbq-sidepanel-close type="button">
                    <span>{{ t().close }}</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleSidepanelComponent {
    private readonly sidepanelRef = inject(KbqSidepanelRef);
    private readonly data: ExampleComponentData = inject(KBQ_SIDEPANEL_DATA);

    protected readonly disableClose = model(this.sidepanelRef.config.disableClose);

    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly open = this.data.open;

    constructor() {
        toObservable(this.disableClose)
            .pipe(takeUntilDestroyed())
            .subscribe((value) => {
                this.sidepanelRef.config.disableClose = value;
            });
    }
}

/**
 * @title Sidepanel with dynamic config update example
 */
@Component({
    selector: 'sidepanel-with-dynamic-config-update-example',
    imports: [FormsModule, KbqButtonModule],
    template: `
        <button kbq-button type="button" (click)="open()">
            <span>{{ t().open }}</span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelWithDynamicConfigUpdateExample {
    private readonly sidepanelService = inject(KbqSidepanelService);

    protected readonly t = injectTranslation(TRANSLATIONS);

    open() {
        this.sidepanelService.open<ExampleSidepanelComponent, ExampleComponentData>(ExampleSidepanelComponent, {
            data: { open: () => this.open() }
        });
    }
}
