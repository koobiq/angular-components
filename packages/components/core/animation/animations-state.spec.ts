import { ApplicationRef, Injector, MAX_ANIMATION_TIMEOUT, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { kbqAfterAnimations } from './animations-state';

describe('kbqAfterAnimations', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('should stop waiting for an animation that never finishes after MAX_ANIMATION_TIMEOUT', async () => {
        vi.useFakeTimers();

        const element = document.createElement('div');
        const callback = vi.fn();
        const timeout = TestBed.inject(MAX_ANIMATION_TIMEOUT);

        // A paused animation: a finite end, but `finished` never settles.
        element.getAnimations = () => [
            {
                effect: { getComputedTiming: () => ({ endTime: 300 }) },
                finished: new Promise(() => {})
            } as unknown as Animation
        ];

        kbqAfterAnimations(() => element, callback, TestBed.inject(Injector));
        TestBed.inject(ApplicationRef).tick();

        await vi.advanceTimersByTimeAsync(timeout - 1);
        expect(callback).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call back on the server, where nothing renders', async () => {
        TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

        const callback = vi.fn();
        const serverMode = globalThis.ngServerMode;

        globalThis.ngServerMode = true;

        try {
            kbqAfterAnimations(() => null, callback, TestBed.inject(Injector));
        } finally {
            globalThis.ngServerMode = serverMode;
        }

        expect(callback).not.toHaveBeenCalled();

        await Promise.resolve();
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
