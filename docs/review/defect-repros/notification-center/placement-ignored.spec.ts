import { FlexibleConnectedPositionStrategy, OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule, KbqPopUpPlacementValues, PopUpPlacements } from '@koobiq/components/core';
import { KbqNotificationCenterModule, KbqNotificationCenterTrigger } from '@koobiq/components/notification-center';

describe('triage: kbqNotificationCenterPlacement', () => {
    let originalGetComputedStyle: typeof window.getComputedStyle;

    // Same stub as notification-center.spec.ts: jsdom's values break the scrollbar and the position strategy.
    beforeAll(() => {
        originalGetComputedStyle = window.getComputedStyle;
        Object.defineProperty(global.window, 'getComputedStyle', {
            configurable: true,
            value: () => ({ getPropertyValue: () => '', textOverflow: '' })
        });
    });

    afterAll(() => {
        Object.defineProperty(global.window, 'getComputedStyle', {
            configurable: true,
            value: originalGetComputedStyle
        });
    });

    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: a bound left placement still offers the overlay only right-side positions', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [PlacementHost, KbqLuxonDateModule, KbqFormattersModule] });
        const fixture = TestBed.createComponent(PlacementHost);

        fixture.detectChanges();

        const trigger = fixture.componentInstance.trigger();

        trigger.show();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(trigger.isOpen).toBe(true);
        // The input reached the member...
        expect(trigger.placement).toBe(PopUpPlacements.Left);

        const positions = (trigger.overlayRef!.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .positions;

        // ...but the strategy only knows the constructor's right / rightBottom / rightTop priority.
        expect(positions).toHaveLength(3);
        expect(positions.every((p) => p.originX === 'end' && p.overlayX === 'start')).toBe(true);
        expect(positions.some((p) => p.originX === 'start' && p.overlayX === 'end')).toBe(false);
    });
});

@Component({
    selector: 'placement-host',
    imports: [KbqNotificationCenterModule],
    template: `
        <button kbqNotificationCenterTrigger [kbqNotificationCenterPlacement]="placement">trigger</button>
    `
})
class PlacementHost {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);

    placement: KbqPopUpPlacementValues = PopUpPlacements.Left;
}
