import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAppSwitcherModule, KbqAppSwitcherSite, KbqAppSwitcherTrigger } from '@koobiq/components/app-switcher';
import { dispatchMouseEvent, typeInElement } from '@koobiq/components/core';

// More than KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH (7) apps, so the search field renders.
const SITE: KbqAppSwitcherSite = {
    id: 'big',
    name: 'Big',
    apps: Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, name: `App ${i}` }))
};

@Component({
    selector: 'test-app',
    imports: [KbqAppSwitcherModule],
    template: `
        <button kbqAppSwitcher [sites]="sites">Trigger</button>
    `
})
class TestApp {
    sites: KbqAppSwitcherSite[] = [SITE];
}

describe('triage: hovering a row moves focus out of the search field', () => {
    let fixture: ComponentFixture<TestApp>;
    let trigger: KbqAppSwitcherTrigger;
    let overlayContainer: OverlayContainer;
    let overlayElement: HTMLElement;

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
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: the pointer entering a search result while typing takes focus away from the query field', async () => {
        const input = overlayElement.querySelector('input[kbqinput]') as HTMLInputElement;

        typeInElement('App', input);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(document.activeElement).toBe(input);

        const result = overlayElement.querySelector(
            '.kbq-app-switcher__search-result .kbq-app-switcher-list-item'
        ) as HTMLElement;

        expect(result).toBeTruthy();

        dispatchMouseEvent(result, 'mouseenter');
        fixture.detectChanges();

        expect(document.activeElement).toBe(result);
        expect(document.activeElement).not.toBe(input);
        expect(trigger.isOpen).toBe(true);
    });
});
