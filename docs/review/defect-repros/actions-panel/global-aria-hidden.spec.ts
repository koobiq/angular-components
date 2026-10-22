import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';
import axe from 'axe-core';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'triage-host',
    template: `
        <button id="row-action">Select row</button>
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

const openGlobalPanel = async () => {
    const fixture = TestBed.createComponent(TriageHost);

    fixture.autoDetectChanges();

    const actionsPanelRef = fixture.componentInstance.actionsPanel.open(fixture.componentInstance.template());

    await lastValueFrom(actionsPanelRef.afterOpened);
    await fixture.whenStable();

    return { fixture, actionsPanelRef };
};

describe('KbqActionsPanel triage: a global panel aria-hides the application', () => {
    it('DEFECT: a non-modal global panel marks the application root aria-hidden while its content stays focusable', async () => {
        const { fixture } = await openGlobalPanel();
        const root: HTMLElement = fixture.nativeElement;
        const overlayContainer = TestBed.inject(OverlayContainer).getContainerElement();
        const panel = overlayContainer.querySelector('.kbq-actions-panel-container')!;

        // The panel is not modal: no aria-modal, no backdrop, focus left where it was.
        expect(panel.getAttribute('role')).toBe('dialog');
        expect(panel.getAttribute('aria-modal')).toBe('false');
        expect(overlayContainer.querySelector('.cdk-overlay-backdrop')).toBeNull();

        // Yet the whole application, the content the panel acts on, is hidden from assistive technology.
        expect(root.closest('[aria-hidden="true"]')).not.toBeNull();
        expect(panel.closest('[aria-hidden="true"]')).toBeNull();

        const rowAction = root.querySelector<HTMLElement>('#row-action')!;

        rowAction.focus();
        expect(document.activeElement).toBe(rowAction);
    });

    // axe takes the panel's role="dialog" for an open modal and so files the finding under `incomplete` (needs review)
    // instead of `violations`: the panel is not modal, so the focusable content really is reachable.
    it('DEFECT: axe flags aria-hidden-focus on the application root while a global panel is open', async () => {
        const { fixture } = await openGlobalPanel();
        // CDK marks the child of `body` that holds the application, the fixture's root element or its wrapper.
        const hiddenRoot = (fixture.nativeElement as HTMLElement).closest('[aria-hidden="true"]')!;

        expect(hiddenRoot.parentElement).toBe(document.body);

        const { violations, incomplete } = await axe.run(hiddenRoot, {
            runOnly: { type: 'rule', values: ['aria-hidden-focus'] }
        });

        expect([...violations, ...incomplete].map(({ id }) => id)).toContain('aria-hidden-focus');
    });
});
