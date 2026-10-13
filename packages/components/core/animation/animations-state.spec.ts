import { ApplicationRef, Injector, MAX_ANIMATION_TIMEOUT, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { kbqAfterAnimations, kbqAnimationsSettled } from './animations-state';

/** An element running one paused animation: a finite end, but `finished` never settles. */
const elementWithPausedAnimation = (): HTMLElement => {
    const element = document.createElement('div');

    element.getAnimations = () => [
        {
            effect: { getComputedTiming: () => ({ endTime: 300 }) },
            finished: new Promise(() => {})
        } as unknown as Animation
    ];

    return element;
};

describe('kbqAnimationsSettled', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('should settle a paused animation once the timeout has passed', async () => {
        vi.useFakeTimers();

        const settled = vi.fn();

        kbqAnimationsSettled(elementWithPausedAnimation(), 1000)!.then(settled);

        await vi.advanceTimersByTimeAsync(999);
        expect(settled).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(settled).toHaveBeenCalledTimes(1);
    });

    it('should clear the timeout once the animations have finished', async () => {
        vi.useFakeTimers();

        const element = document.createElement('div');

        element.getAnimations = () => [
            {
                effect: { getComputedTiming: () => ({ endTime: 300 }) },
                finished: Promise.resolve()
            } as unknown as Animation
        ];

        await kbqAnimationsSettled(element, 1000);

        expect(vi.getTimerCount()).toBe(0);
    });
});

describe('kbqAfterAnimations', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('should stop waiting for an animation that never finishes after MAX_ANIMATION_TIMEOUT', async () => {
        vi.useFakeTimers();

        const element = elementWithPausedAnimation();
        const callback = vi.fn();
        const timeout = TestBed.inject(MAX_ANIMATION_TIMEOUT);

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
