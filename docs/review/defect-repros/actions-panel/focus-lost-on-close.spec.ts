import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';
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

const openFromFocusedTrigger = async () => {
    const fixture = TestBed.createComponent(TriageHost);

    fixture.autoDetectChanges();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('#row-action')!;

    trigger.focus();

    const actionsPanelRef = fixture.componentInstance.actionsPanel.open(fixture.componentInstance.template());

    await lastValueFrom(actionsPanelRef.afterOpened);
    await fixture.whenStable();

    // The panel takes no focus when it opens.
    expect(document.activeElement).toBe(trigger);

    const panel = TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector<HTMLElement>('.kbq-actions-panel-container')!;

    return { fixture, actionsPanelRef, trigger, panel };
};

describe('KbqActionsPanel triage: focus is lost when the panel closes itself', () => {
    it('DEFECT: closing with the close button leaves focus on body', async () => {
        const { fixture, actionsPanelRef, trigger, panel } = await openFromFocusedTrigger();
        const closeButton = panel.querySelector<HTMLElement>('.kbq-actions-panel-container__close-button')!;

        closeButton.focus();
        expect(document.activeElement).toBe(closeButton);

        const afterClosed = lastValueFrom(actionsPanelRef.afterClosed);

        closeButton.click();
        await afterClosed;
        await fixture.whenStable();

        expect(document.activeElement).toBe(document.body);
        expect(document.activeElement).not.toBe(trigger);
    });

    it('DEFECT: closing with Escape from a control inside the panel leaves focus on body', async () => {
        const { fixture, actionsPanelRef, trigger, panel } = await openFromFocusedTrigger();
        const action = panel.querySelector<HTMLElement>('#panel-action')!;

        action.focus();
        expect(document.activeElement).toBe(action);

        const afterClosed = lastValueFrom(actionsPanelRef.afterClosed);

        action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        await afterClosed;
        await fixture.whenStable();

        expect(document.activeElement).toBe(document.body);
        expect(document.activeElement).not.toBe(trigger);
    });
});
