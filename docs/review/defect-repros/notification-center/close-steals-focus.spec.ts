import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchFakeEvent, KbqFormattersModule } from '@koobiq/components/core';
import { KbqNotificationCenterModule, KbqNotificationCenterTrigger } from '@koobiq/components/notification-center';

describe('triage: focus on close', () => {
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

    it('DEFECT: clicking into a text field outside the open panel closes it and moves focus from the field to the trigger', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [OutsideFieldHost, KbqLuxonDateModule, KbqFormattersModule] });
        const fixture = TestBed.createComponent(OutsideFieldHost);

        fixture.detectChanges();

        const trigger = fixture.componentInstance.trigger();
        const field = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        const triggerElement = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

        trigger.show();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(trigger.isOpen).toBe(true);

        // The user clicks into a text field elsewhere on the page: it takes focus on pointerdown, then clicks.
        dispatchFakeEvent(field, 'pointerdown', true);
        field.focus();
        field.click();

        expect(document.activeElement).toBe(field);

        await vi.advanceTimersByTimeAsync(10);
        fixture.detectChanges();

        expect(trigger.isOpen).toBe(false);
        expect(document.activeElement).toBe(triggerElement);
    });
});

@Component({
    selector: 'outside-field-host',
    imports: [KbqNotificationCenterModule],
    template: `
        <input aria-label="search" />
        <button kbqNotificationCenterTrigger>trigger</button>
    `
})
class OutsideFieldHost {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
}
