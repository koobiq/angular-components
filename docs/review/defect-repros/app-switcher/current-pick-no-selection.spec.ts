import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KbqAppSwitcherApp,
    KbqAppSwitcherComponent,
    KbqAppSwitcherModule,
    KbqAppSwitcherSite,
    KbqAppSwitcherTrigger
} from '@koobiq/components/app-switcher';

// No `link`, like the apps of the overview docs example.
const SITE: KbqAppSwitcherSite = {
    id: 'site',
    name: 'Site',
    apps: Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, name: `App ${i}` }))
};

@Component({
    selector: 'test-app',
    imports: [KbqAppSwitcherModule],
    template: `
        <button kbqAppSwitcher [sites]="sites" [(selectedApp)]="selectedApp">Trigger</button>
    `
})
class TestApp {
    sites: KbqAppSwitcherSite[] = [SITE];
    selectedApp: KbqAppSwitcherApp | undefined = SITE.apps[0];
}

describe('triage: a pick in the current site list or the search results never writes selectedApp', () => {
    let fixture: ComponentFixture<TestApp>;
    let trigger: KbqAppSwitcherTrigger;
    let popup: KbqAppSwitcherComponent;
    let overlayContainer: OverlayContainer;
    let overlayElement: HTMLElement;

    const rowNamed = (name: string): HTMLElement =>
        Array.from(overlayElement.querySelectorAll<HTMLElement>('.kbq-app-switcher-list-item')).find(
            (row) => row.textContent?.trim() === name
        )!;

    beforeEach(async () => {
        vi.useFakeTimers();

        fixture = TestBed.createComponent(TestApp);
        fixture.autoDetectChanges();

        overlayContainer = TestBed.inject(OverlayContainer);
        overlayElement = overlayContainer.getContainerElement();

        trigger = fixture.debugElement.query(By.directive(KbqAppSwitcherTrigger)).injector.get(KbqAppSwitcherTrigger);

        trigger.show();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        popup = trigger['instance'] as KbqAppSwitcherComponent;
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: clicking another app of a single-site switcher leaves [(selectedApp)] unchanged and emits nothing', async () => {
        const changeSpy = vi.fn();

        trigger.selectedApp.subscribe(changeSpy);

        const row = rowNamed('App 3');

        expect(row).toBeTruthy();
        expect(row.hasAttribute('href')).toBe(false);

        row.click();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(changeSpy).not.toHaveBeenCalled();
        expect(trigger.selectedApp()?.id).toBe('a0');
        expect(fixture.componentInstance.selectedApp?.id).toBe('a0');
        expect(row.classList).not.toContain('kbq-selected');
        // Nothing else happens either: the popup stays open.
        expect(trigger.isOpen).toBe(true);
    });

    it('DEFECT: clicking a search result leaves [(selectedApp)] unchanged and emits nothing', async () => {
        const changeSpy = vi.fn();

        trigger.selectedApp.subscribe(changeSpy);

        popup.searchControl.setValue('App 5');
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        const result = rowNamed('App 5');

        expect(result).toBeTruthy();
        expect(result.closest('.kbq-app-switcher__search-result')).toBeTruthy();

        result.click();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(changeSpy).not.toHaveBeenCalled();
        expect(fixture.componentInstance.selectedApp?.id).toBe('a0');
    });
});
