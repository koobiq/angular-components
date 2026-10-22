import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';
import axe from 'axe-core';
import { lastValueFrom } from 'rxjs';

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

const openPanel = async (): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(TriageHost);

    fixture.autoDetectChanges();

    const actionsPanelRef = fixture.componentInstance.actionsPanel.open(fixture.componentInstance.template());

    await lastValueFrom(actionsPanelRef.afterOpened);
    await fixture.whenStable();

    return TestBed.inject(OverlayContainer).getContainerElement();
};

describe('KbqActionsPanel triage: the dialog has no accessible name', () => {
    it('DEFECT: the panel has role="dialog" with neither aria-label nor aria-labelledby', async () => {
        const overlayContainer = await openPanel();
        const panel = overlayContainer.querySelector('.kbq-actions-panel-container')!;

        expect(panel.getAttribute('role')).toBe('dialog');
        expect(panel.hasAttribute('aria-label')).toBe(false);
        expect(panel.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('DEFECT: axe reports aria-dialog-name on an open panel', async () => {
        const overlayContainer = await openPanel();
        const { violations } = await axe.run(overlayContainer, {
            runOnly: { type: 'rule', values: ['aria-dialog-name'] }
        });

        expect(violations.map(({ id }) => id)).toContain('aria-dialog-name');
    });
});
