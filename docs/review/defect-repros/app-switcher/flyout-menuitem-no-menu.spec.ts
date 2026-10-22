import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAppSwitcherModule, KbqAppSwitcherSite, KbqAppSwitcherTrigger } from '@koobiq/components/app-switcher';
import { ENTER, dispatchKeyboardEvent } from '@koobiq/components/core';

const SITES: KbqAppSwitcherSite[] = [
    {
        id: 'siteA',
        name: 'Site A',
        apps: [
            { id: 'a1', name: 'App A1' },
            { id: 'a2', name: 'App A2' }
        ]
    },
    {
        id: 'siteB',
        name: 'Site B',
        apps: [
            { id: 'b1', name: 'App B1' },
            { id: 'b2', name: 'App B2' }
        ]
    }
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

describe('triage: the rows of a site flyout are menu items outside any menu', () => {
    let fixture: ComponentFixture<TestApp>;
    let trigger: KbqAppSwitcherTrigger;
    let overlayContainer: OverlayContainer;

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: a flyout row has role="menuitem" with no role="menu" ancestor (axe aria-required-parent)', async () => {
        vi.useFakeTimers();

        fixture = TestBed.createComponent(TestApp);
        fixture.autoDetectChanges();

        overlayContainer = TestBed.inject(OverlayContainer);

        const overlayElement = overlayContainer.getContainerElement();

        trigger = fixture.debugElement.query(By.directive(KbqAppSwitcherTrigger)).injector.get(KbqAppSwitcherTrigger);

        trigger.show();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        const siteRow = overlayElement.querySelector('.kbq-app-switcher-dropdown-site') as HTMLElement;

        siteRow.focus();
        fixture.detectChanges();
        dispatchKeyboardEvent(siteRow, 'keydown', ENTER);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        const flyoutRow = overlayElement.querySelector('.kbq-app-switcher-dropdown-app') as HTMLElement;

        expect(flyoutRow).toBeTruthy();
        expect(flyoutRow.getAttribute('role')).toBe('menuitem');
        expect(flyoutRow.closest('[role="menu"]')).toBeNull();
        // The main list does sit in a menu.
        expect(siteRow.closest('[role="menu"]')).not.toBeNull();

        // axe needs real timers.
        vi.useRealTimers();

        const flyoutPane = flyoutRow.closest('.cdk-overlay-pane') as HTMLElement;

        await expect(flyoutPane).not.toHaveNoViolations({ runOnly: ['aria-required-parent'] });
    }, 15000);
});
