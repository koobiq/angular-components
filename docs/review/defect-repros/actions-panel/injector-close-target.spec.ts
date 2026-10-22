import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, Injector, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';
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

const createHost = () => {
    const fixture = TestBed.createComponent(TriageHost);

    fixture.autoDetectChanges();

    return fixture;
};

const panelByClass = (cssClass: string): HTMLElement | null =>
    TestBed.inject(OverlayContainer).getContainerElement().querySelector<HTMLElement>(`.${cssClass}`);

const pressEscape = (element: HTMLElement): void => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
};

describe('KbqActionsPanel triage: the close button and Escape close the instance the injector resolves', () => {
    it('DEFECT: with injector set to the root injector, the close button and Escape leave their own panel open', async () => {
        const fixture = createHost();
        const { actionsPanel, template } = fixture.componentInstance;

        expect(TestBed.inject(KbqActionsPanel)).not.toBe(actionsPanel);

        const actionsPanelRef = actionsPanel.open(template(), {
            containerClass: 'triage-own',
            injector: TestBed.inject(Injector)
        });
        const afterClosed = vi.fn();

        actionsPanelRef.afterClosed.subscribe(afterClosed);
        await lastValueFrom(actionsPanelRef.afterOpened);
        await fixture.whenStable();

        const panel = panelByClass('triage-own')!;

        panel.querySelector<HTMLElement>('.kbq-actions-panel-container__close-button')!.click();
        await fixture.whenStable();

        expect(afterClosed).not.toHaveBeenCalled();
        expect(panelByClass('triage-own')).not.toBeNull();

        pressEscape(panel.querySelector<HTMLElement>('#panel-action')!);
        await fixture.whenStable();

        expect(afterClosed).not.toHaveBeenCalled();
        expect(panelByClass('triage-own')).not.toBeNull();
    });

    it('DEFECT: the close button of one panel closes the panel of the instance its injector resolves', async () => {
        const fixture = createHost();
        const { actionsPanel, template } = fixture.componentInstance;
        const rootActionsPanel = TestBed.inject(KbqActionsPanel);

        const otherRef = rootActionsPanel.open(template(), { containerClass: 'triage-other' });
        const ownRef = actionsPanel.open(template(), {
            containerClass: 'triage-own',
            injector: TestBed.inject(Injector)
        });
        const otherClosed = vi.fn();
        const ownClosed = vi.fn();

        otherRef.afterClosed.subscribe(otherClosed);
        ownRef.afterClosed.subscribe(ownClosed);
        await fixture.whenStable();

        panelByClass('triage-own')!.querySelector<HTMLElement>('.kbq-actions-panel-container__close-button')!.click();
        await lastValueFrom(otherRef.afterClosed);
        await fixture.whenStable();

        expect(otherClosed).toHaveBeenCalledTimes(1);
        expect(ownClosed).not.toHaveBeenCalled();
        expect(panelByClass('triage-other')).toBeNull();
        expect(panelByClass('triage-own')).not.toBeNull();
    });
});
