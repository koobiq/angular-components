import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAppSwitcherModule, KbqAppSwitcherSite, KbqAppSwitcherTrigger } from '@koobiq/components/app-switcher';

const SITES: KbqAppSwitcherSite[] = [
    {
        id: 'siteA',
        name: 'Site A',
        apps: [
            { id: 'a1', name: 'App A1' },
            { id: 'a2', name: 'App A2' }
        ]
    },
    { id: 'siteB', name: 'Site B', apps: [{ id: 'b1', name: 'App B1' }] }
];

@Component({
    selector: 'test-app',
    imports: [KbqAppSwitcherModule],
    template: `
        <button kbqAppSwitcher [sites]="sites" [selectedSite]="sites[0]">Trigger</button>
    `
})
class TestApp {
    sites: KbqAppSwitcherSite[] = SITES;
}

describe('triage: closing the switcher always moves focus to the trigger', () => {
    let fixture: ComponentFixture<TestApp>;
    let trigger: KbqAppSwitcherTrigger;
    let triggerElement: HTMLElement;
    let overlayContainer: OverlayContainer;
    let outside: HTMLInputElement;

    beforeEach(async () => {
        vi.useFakeTimers();

        fixture = TestBed.createComponent(TestApp);
        fixture.autoDetectChanges();

        overlayContainer = TestBed.inject(OverlayContainer);

        const triggerDebug = fixture.debugElement.query(By.directive(KbqAppSwitcherTrigger));

        trigger = triggerDebug.injector.get(KbqAppSwitcherTrigger);
        triggerElement = triggerDebug.nativeElement;

        outside = document.createElement('input');
        document.body.appendChild(outside);

        trigger.show();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
    });

    afterEach(() => {
        outside.remove();
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: focusing a field outside the open switcher (as a click on it does) ends with focus on the trigger', async () => {
        const row = overlayContainer.getContainerElement().querySelector('.kbq-app-switcher-list-item') as HTMLElement;

        row.focus();
        expect(document.activeElement).toBe(row);

        // What a click on another focusable element of the page does first.
        outside.focus();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(trigger.isOpen).toBe(false);
        expect(document.activeElement).toBe(triggerElement);
        expect(document.activeElement).not.toBe(outside);
    });
});
