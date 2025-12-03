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

type ExampleComponentData = {
    open: () => void;
};

@Component({
    selector: 'example-sidepanel-component',
    imports: [KbqSidepanelModule, KbqButtonModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">Header</kbq-sidepanel-header>
        <kbq-sidepanel-body>
            <kbq-toggle [(ngModel)]="hasBackdrop">Has backdrop</kbq-toggle>
            <kbq-toggle [(ngModel)]="disableClose">Disable close</kbq-toggle>
        </kbq-sidepanel-body>
        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button color="contrast" (click)="open()">
                    <span>Open another sidepanel</span>
                </button>

                <button kbq-button kbq-sidepanel-close>
                    <span>Close</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleSidepanelComponent {
    private readonly sidepanelRef = inject(KbqSidepanelRef);
    private readonly data: ExampleComponentData = inject(KBQ_SIDEPANEL_DATA);

    protected readonly hasBackdrop = model(this.sidepanelRef.config.hasBackdrop);
    protected readonly disableClose = model(this.sidepanelRef.config.disableClose);
    protected readonly open = this.data.open;

    constructor() {
        toObservable(this.hasBackdrop)
            .pipe(takeUntilDestroyed())
            .subscribe((value) => {
                this.sidepanelRef.overlayRef.backdropElement!.hidden = !value;
            });
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
        <button kbq-button (click)="open()">
            <span>Open</span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelWithDynamicConfigUpdateExample {
    private readonly sidepanelService = inject(KbqSidepanelService);

    open() {
        this.sidepanelService.open<ExampleSidepanelComponent, ExampleComponentData>(ExampleSidepanelComponent, {
            data: { open: () => this.open() }
        });
    }
}
