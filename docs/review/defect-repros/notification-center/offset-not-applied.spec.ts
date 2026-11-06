import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqNotificationCenterModule, KbqNotificationCenterTrigger } from '@koobiq/components/notification-center';

describe('triage: notification center offset', () => {
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

    it('DEFECT: the offset never becomes a margin because the panel host never gets the placement class', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [OffsetHost, KbqLuxonDateModule, KbqFormattersModule] });
        const fixture = TestBed.createComponent(OffsetHost);

        fixture.detectChanges();

        const trigger = fixture.componentInstance.trigger();

        trigger.show();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        expect(trigger.isOpen).toBe(true);

        const instance = (
            trigger as unknown as { instance: { offset: number | null; classMap: Record<string, boolean> } }
        ).instance;
        const panel = TestBed.inject(OverlayContainer)
            .getContainerElement()
            .querySelector<HTMLElement>('.kbq-notification-center')!;

        // The trigger hands the offset over and computes the placement class...
        expect(instance.offset).toBe(20);
        expect(Object.keys(instance.classMap)).toContain('kbq-notification-center_placement-right');

        // ...but nothing binds the class map, so applyPopupMargins finds no placement class and sets no margin.
        expect(Array.from(panel.classList).some((c) => c.startsWith('kbq-notification-center_placement-'))).toBe(false);
        expect(panel.style.marginLeft).toBe('');
        expect(panel.style.marginRight).toBe('');
        expect(panel.style.marginTop).toBe('');
        expect(panel.style.marginBottom).toBe('');
    });
});

@Component({
    selector: 'offset-host',
    imports: [KbqNotificationCenterModule],
    template: `
        <button kbqNotificationCenterTrigger [offset]="20">trigger</button>
    `
})
class OffsetHost {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
}
