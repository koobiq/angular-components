import { Dialog } from '@angular/cdk/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqActionsPanel, KbqActionsPanelRef } from '@koobiq/components/actions-panel';
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

const openPanel = async () => {
    TestBed.configureTestingModule({ providers: [{ provide: Location, useClass: SpyLocation }] });

    const fixture = TestBed.createComponent(TriageHost);

    fixture.autoDetectChanges();

    const actionsPanelRef = fixture.componentInstance.actionsPanel.open(fixture.componentInstance.template());

    await lastValueFrom(actionsPanelRef.afterOpened);
    await fixture.whenStable();

    const container = TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector<HTMLElement>('.kbq-actions-panel-container')!;
    const emitted: string[] = [];

    actionsPanelRef.beforeClosed.subscribe((result) => emitted.push(`beforeClosed:${result}`));
    actionsPanelRef.afterClosed.subscribe((result) => emitted.push(`afterClosed:${result}`));

    return { fixture, actionsPanelRef, container, emitted };
};

describe('KbqActionsPanel triage: closing that bypasses KbqActionsPanelRef.close()', () => {
    it.each([
        {
            closer: 'closing on history navigation',
            close: () => (TestBed.inject(Location) as SpyLocation).simulateUrlPop('')
        },
        { closer: 'Dialog.closeAll()', close: () => TestBed.inject(Dialog).closeAll() },
        { closer: 'an overlay disposed from outside', close: (ref: KbqActionsPanelRef) => ref.overlayRef.dispose() }
    ])('DEFECT: $closer never emits beforeClosed and skips the exit animation', async ({ close }) => {
        const { fixture, actionsPanelRef, container, emitted } = await openPanel();

        close(actionsPanelRef);
        await fixture.whenStable();

        expect(emitted).toEqual(['afterClosed:undefined']);
        expect(container.isConnected).toBe(false);
        // Removed while still in the visible state: the exit transition never started.
        expect(container.classList).toContain('kbq-actions-panel-container_visible');

        // A later close() on the reference reports the panel as starting to close, after it has finished closing.
        actionsPanelRef.close('late');
        expect(emitted).toEqual(['afterClosed:undefined', 'beforeClosed:late']);
    });
});
