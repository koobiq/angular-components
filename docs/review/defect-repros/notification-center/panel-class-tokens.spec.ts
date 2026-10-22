import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqNotificationCenterModule, KbqNotificationCenterTrigger } from '@koobiq/components/notification-center';

describe('triage: kbqNotificationCenterPanelClass', () => {
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

    const setUp = (panelClass: string) => {
        TestBed.configureTestingModule({ imports: [PanelClassHost, KbqLuxonDateModule, KbqFormattersModule] });
        const fixture = TestBed.createComponent(PanelClassHost);

        fixture.componentInstance.panelClass = panelClass;
        fixture.detectChanges();

        return fixture;
    };

    const getPane = () =>
        TestBed.inject(OverlayContainer).getContainerElement().querySelector<HTMLElement>('.cdk-overlay-pane');

    it('DEFECT: a space-separated panel class makes opening the panel throw InvalidCharacterError', () => {
        const fixture = setUp('first second');
        const trigger = fixture.componentInstance.trigger();

        let error: unknown;

        try {
            trigger.show();
        } catch (e) {
            error = e;
        }

        expect((error as DOMException | undefined)?.name).toBe('InvalidCharacterError');
        expect(trigger.isOpen).toBe(false);
    });

    it('DEFECT: a panel class changed after the first open never reaches the overlay pane', async () => {
        vi.useFakeTimers();

        const fixture = setUp('first');
        const trigger = fixture.componentInstance.trigger();

        trigger.show();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(trigger.isOpen).toBe(true);
        expect(getPane()!.classList).toContain('first');

        trigger.hide();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(10);
        fixture.detectChanges();

        expect(trigger.isOpen).toBe(false);

        fixture.componentInstance.panelClass = 'second';
        fixture.detectChanges();

        trigger.show();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(trigger.isOpen).toBe(true);
        expect(getPane()!.classList).not.toContain('second');
        expect(getPane()!.classList).toContain('first');
    });
});

@Component({
    selector: 'panel-class-host',
    imports: [KbqNotificationCenterModule],
    template: `
        <button kbqNotificationCenterTrigger [kbqNotificationCenterPanelClass]="panelClass">trigger</button>
    `
})
class PanelClassHost {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);

    panelClass = '';
}
