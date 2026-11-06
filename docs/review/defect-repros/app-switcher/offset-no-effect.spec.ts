import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KbqAppSwitcherComponent,
    KbqAppSwitcherModule,
    KbqAppSwitcherSite,
    KbqAppSwitcherTrigger
} from '@koobiq/components/app-switcher';

const SITE: KbqAppSwitcherSite = {
    id: 'site',
    name: 'Site',
    apps: [
        { id: 'a', name: 'App A' },
        { id: 'b', name: 'App B' }
    ]
};

@Component({
    selector: 'test-app',
    imports: [KbqAppSwitcherModule],
    template: `
        <button kbqAppSwitcher [sites]="sites" [offset]="20">Trigger</button>
    `
})
class TestApp {
    sites: KbqAppSwitcherSite[] = [SITE];
}

describe('triage: the placement and size classes of the popup are computed but never bound', () => {
    let fixture: ComponentFixture<TestApp>;
    let trigger: KbqAppSwitcherTrigger;
    let overlayContainer: OverlayContainer;

    beforeEach(async () => {
        vi.useFakeTimers();

        fixture = TestBed.createComponent(TestApp);
        fixture.autoDetectChanges();

        overlayContainer = TestBed.inject(OverlayContainer);

        trigger = fixture.debugElement.query(By.directive(KbqAppSwitcherTrigger)).injector.get(KbqAppSwitcherTrigger);

        trigger.show();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: [offset]="20" writes no margin because the host lacks the kbq-app-switcher_placement-* class', async () => {
        const popup = trigger['instance'] as KbqAppSwitcherComponent;
        const host = overlayContainer.getContainerElement().querySelector('.kbq-app-switcher') as HTMLElement;

        expect(popup.offset).toBe(20);

        const placementClass = Object.keys(popup.classMap).find((name) =>
            name.startsWith('kbq-app-switcher_placement-')
        );

        // Computed...
        expect(placementClass).toBeDefined();
        expect(popup.classMap).toHaveProperty('kbq-app-switcher_medium', true);

        // ...but never rendered.
        expect(Array.from(host.classList).some((name) => name.startsWith('kbq-app-switcher_placement-'))).toBe(false);
        expect(host.classList).not.toContain('kbq-app-switcher_medium');

        // The step that runs on every show writes nothing.
        popup.visibleChange.emit(true);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(host.style.marginTop).toBe('');
        expect(host.style.marginBottom).toBe('');

        // Control: with the class the popup computed, the very same step applies the offset.
        host.classList.add(placementClass!);
        popup.visibleChange.emit(true);

        expect(host.style.marginTop || host.style.marginBottom).toBe('20px');
    });
});
