import { Directionality } from '@angular/cdk/bidi';
import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqActionsPanel, KbqActionsPanelConfig } from '@koobiq/components/actions-panel';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'triage-direction-reader',
    template: '<span>content</span>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DirectionReader {
    readonly dir = inject(Directionality);
}

@Component({
    selector: 'triage-host',
    template: '',
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TriageHost {
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
}

const openReader = async (config?: KbqActionsPanelConfig) => {
    const fixture = TestBed.createComponent(TriageHost);

    fixture.autoDetectChanges();

    const actionsPanelRef = fixture.componentInstance.actionsPanel.open(DirectionReader, config);

    await lastValueFrom(actionsPanelRef.afterOpened);
    await fixture.whenStable();

    const reader = TestBed.inject(Dialog).openDialogs[0].componentInstance as DirectionReader;

    return { actionsPanelRef, reader };
};

describe('KbqActionsPanel triage: direction does not reach the content', () => {
    it('DEFECT: direction "rtl" sets the overlay dir, but the content still reads an "ltr" Directionality', async () => {
        const { actionsPanelRef, reader } = await openReader({ direction: 'rtl' });

        expect(actionsPanelRef.overlayRef.hostElement.getAttribute('dir')).toBe('rtl');
        expect(reader.dir.value).toBe('ltr');
    });

    it('DEFECT: in an RTL application the default config renders the panel "ltr"', async () => {
        document.documentElement.setAttribute('dir', 'rtl');

        try {
            const { actionsPanelRef, reader } = await openReader();

            expect(TestBed.inject(Directionality).value).toBe('rtl');
            expect(reader.dir.value).toBe('rtl');
            expect(actionsPanelRef.overlayRef.hostElement.getAttribute('dir')).toBe('ltr');
        } finally {
            document.documentElement.removeAttribute('dir');
        }
    });
});
