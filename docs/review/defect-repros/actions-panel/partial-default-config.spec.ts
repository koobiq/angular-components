import { BlockScrollStrategy, RepositionScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, Provider, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    KBQ_ACTIONS_PANEL_DATA,
    KbqActionsPanel,
    kbqActionsPanelDefaultConfigProvider
} from '@koobiq/components/actions-panel';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'triage-data-reader',
    template: '<span>content</span>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DataReader {
    static lastData: unknown = 'not injected';

    constructor() {
        DataReader.lastData = inject(KBQ_ACTIONS_PANEL_DATA);
    }
}

@Component({
    selector: 'triage-host',
    template: `
        <ng-template #panel>
            <button id="panel-action">Delete</button>
        </ng-template>
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TriageHost {
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    readonly template = viewChild.required('panel', { read: TemplateRef });
}

const createHost = (providers: Provider[]) => {
    TestBed.configureTestingModule({ providers });

    const fixture = TestBed.createComponent(TriageHost);

    fixture.autoDetectChanges();

    return fixture;
};

describe('KbqActionsPanel triage: a partial default config drops the class defaults', () => {
    it('reference: without the provider the panel uses the reposition strategy', () => {
        const fixture = createHost([]);
        const actionsPanelRef = fixture.componentInstance.actionsPanel.open(fixture.componentInstance.template());

        expect(actionsPanelRef.overlayRef.getConfig().scrollStrategy).toBeInstanceOf(RepositionScrollStrategy);
    });

    it('DEFECT: a partial default config makes CDK fall back to the dialog block scroll strategy', () => {
        const fixture = createHost([kbqActionsPanelDefaultConfigProvider({ disableClose: true })]);
        const actionsPanelRef = fixture.componentInstance.actionsPanel.open(fixture.componentInstance.template());

        expect(actionsPanelRef.overlayRef.getConfig().scrollStrategy).toBeInstanceOf(BlockScrollStrategy);
    });

    it('DEFECT: a partial default config locks page scrolling while the panel is open', async () => {
        const html = document.documentElement;
        const scroll = vi.spyOn(window, 'scroll').mockImplementation(() => {});

        // A page taller than the viewport, which jsdom cannot lay out on its own.
        Object.defineProperty(html, 'scrollHeight', { configurable: true, get: () => 10000 });

        try {
            const fixture = createHost([kbqActionsPanelDefaultConfigProvider({ disableClose: true })]);
            const actionsPanelRef = fixture.componentInstance.actionsPanel.open(fixture.componentInstance.template());

            expect(html.classList).toContain('cdk-global-scrollblock');

            actionsPanelRef.close();
            await lastValueFrom(actionsPanelRef.afterClosed);

            expect(html.classList).not.toContain('cdk-global-scrollblock');
        } finally {
            delete (html as unknown as { scrollHeight?: number }).scrollHeight;
            scroll.mockRestore();
        }
    });

    it('DEFECT: a partial default config injects undefined instead of null as KBQ_ACTIONS_PANEL_DATA', () => {
        const fixture = createHost([kbqActionsPanelDefaultConfigProvider({ disableClose: true })]);

        fixture.componentInstance.actionsPanel.open(DataReader);

        expect(DataReader.lastData).toBeUndefined();
    });

    it('reference: without the provider KBQ_ACTIONS_PANEL_DATA is null', () => {
        const fixture = createHost([]);

        fixture.componentInstance.actionsPanel.open(DataReader);

        expect(DataReader.lastData).toBeNull();
    });
});
