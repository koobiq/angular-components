import { createEnvironmentInjector, DestroyRef, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { kbqLeaveTabOrderOnTabOut } from './leave-tab-order';

describe('kbqLeaveTabOrderOnTabOut', () => {
    let tabOut: Subject<void>;
    let host: HTMLElement;
    let injector: EnvironmentInjector;
    let renderedTabIndex: number | null;

    beforeEach(() => {
        vi.useFakeTimers();

        tabOut = new Subject<void>();
        host = document.createElement('div');
        host.tabIndex = 0;
        renderedTabIndex = 0;
        injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

        kbqLeaveTabOrderOnTabOut(tabOut, host, () => renderedTabIndex, injector.get(DestroyRef));
    });

    afterEach(() => vi.useRealTimers());

    it('should take the host out of the tab order until the next macrotask', async () => {
        tabOut.next();

        expect(host.getAttribute('tabindex')).toBe('-1');

        await vi.advanceTimersByTimeAsync(0);

        expect(host.getAttribute('tabindex')).toBe('0');
    });

    it('should put back the tab index rendered by the time it restores', async () => {
        tabOut.next();
        renderedTabIndex = 3;
        await vi.advanceTimersByTimeAsync(0);

        expect(host.getAttribute('tabindex')).toBe('3');
    });

    it('should drop the tab index when the host renders none', async () => {
        host.removeAttribute('tabindex');
        renderedTabIndex = null;

        tabOut.next();

        expect(host.getAttribute('tabindex')).toBe('-1');

        await vi.advanceTimersByTimeAsync(0);

        expect(host.hasAttribute('tabindex')).toBe(false);
    });

    it('should keep one pending restore across repeated tab outs', () => {
        tabOut.next();
        tabOut.next();
        tabOut.next();

        expect(vi.getTimerCount()).toBe(1);
    });

    it('should cancel a pending restore when destroyed', async () => {
        tabOut.next();
        injector.destroy();

        expect(vi.getTimerCount()).toBe(0);

        await vi.advanceTimersByTimeAsync(0);

        expect(host.getAttribute('tabindex')).toBe('-1');
    });

    it('should stop listening when destroyed', () => {
        injector.destroy();
        tabOut.next();

        expect(host.getAttribute('tabindex')).toBe('0');
    });
});
