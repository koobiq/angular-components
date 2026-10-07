import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqSkeleton } from './skeleton';

const waveAnimationName = 'kbq-skeleton-wave';
const offscreenClass = 'kbq-skeleton_offscreen';

@Component({
    selector: 'test-skeleton',
    imports: [KbqSkeleton],
    template: `
        <kbq-skeleton />
        <button [kbqSkeleton]="loading()">
            <span>Save</span>
        </button>
    `
})
class TestSkeleton {
    readonly loading = signal(false);
}

/**
 * A window with the two APIs the wave needs and jsdom lacks in a usable form: frames run only when flushed, and the
 * viewport observer reports whatever the test tells it to.
 */
const createWindow = () => {
    const frames: FrameRequestCallback[] = [];
    const observed = new Set<Element>();
    let report: (target: Element, isIntersecting: boolean) => void = () => {};

    class FakeIntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
            report = (target, isIntersecting) =>
                callback(
                    [{ target, isIntersecting } as IntersectionObserverEntry],
                    this as unknown as IntersectionObserver
                );
        }

        observe(target: Element): void {
            observed.add(target);
        }

        unobserve(target: Element): void {
            observed.delete(target);
        }
    }

    return {
        window: {
            requestAnimationFrame: (callback: FrameRequestCallback) => frames.push(callback),
            IntersectionObserver: FakeIntersectionObserver
        },
        flushFrames: () => frames.splice(0).forEach((callback) => callback(0)),
        observed,
        report: (target: Element, isIntersecting: boolean) => report(target, isIntersecting)
    };
};

const createFixture = (): ComponentFixture<TestSkeleton> => {
    const fixture = TestBed.createComponent(TestSkeleton);

    fixture.detectChanges();

    return fixture;
};

const getSkeletons = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
    fixture.debugElement.queryAll(By.directive(KbqSkeleton)).map(({ nativeElement }) => nativeElement);

const dispatchAnimationEvent = (
    target: Element,
    type: 'animationstart' | 'animationiteration',
    animationName = waveAnimationName
): void => {
    const event = new Event(type, { bubbles: true });

    Object.defineProperty(event, 'animationName', { value: animationName });
    target.dispatchEvent(event);
};

/** jsdom has no Web Animations API: the element reports a single running animation instead. */
const stubAnimation = (element: HTMLElement, startTime: number, animationName = waveAnimationName): Animation => {
    const animation = { animationName, startTime } as unknown as Animation;

    element.getAnimations = () => [animation];

    return animation;
};

const getOffset = (element: HTMLElement): string => element.style.getPropertyValue('--kbq-skeleton-offset');

describe(KbqSkeleton.name, () => {
    let env: ReturnType<typeof createWindow>;

    beforeEach(() => {
        env = createWindow();
        TestBed.configureTestingModule({
            imports: [TestSkeleton],
            providers: [{ provide: KBQ_WINDOW, useValue: env.window }]
        });
    });

    it('should add the disabled modifier while disabled', () => {
        const fixture = createFixture();
        const [element, button] = getSkeletons(fixture);

        expect(element.classList).not.toContain('kbq-skeleton_disabled');
        expect(button.classList).toContain('kbq-skeleton_disabled');

        fixture.componentInstance.loading.set(true);
        fixture.detectChanges();

        expect(button.classList).not.toContain('kbq-skeleton_disabled');
    });

    it('should make the host inert only while enabled', () => {
        const fixture = createFixture();
        const [element, button] = getSkeletons(fixture);

        expect(element.hasAttribute('inert')).toBe(true);
        expect(button.hasAttribute('inert')).toBe(false);

        fixture.componentInstance.loading.set(true);
        fixture.detectChanges();

        expect(button.hasAttribute('inert')).toBe(true);

        fixture.componentInstance.loading.set(false);
        fixture.detectChanges();

        expect(button.hasAttribute('inert')).toBe(false);
    });

    it('should shift the wave by the host offset on every pass', () => {
        const [element] = getSkeletons(createFixture());
        const rect = jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left: 42 } as DOMRect);

        stubAnimation(element, 0);
        dispatchAnimationEvent(element, 'animationstart');
        env.flushFrames();

        expect(getOffset(element)).toBe('42px');

        rect.mockReturnValue({ left: 56 } as DOMRect);
        dispatchAnimationEvent(element, 'animationiteration');
        env.flushFrames();

        expect(getOffset(element)).toBe('56px');
    });

    it('should not write an unchanged offset back', () => {
        const [element] = getSkeletons(createFixture());

        jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left: 42 } as DOMRect);

        const write = jest.spyOn(element.style, 'setProperty');

        dispatchAnimationEvent(element, 'animationiteration');
        env.flushFrames();
        dispatchAnimationEvent(element, 'animationiteration');
        env.flushFrames();

        expect(write).toHaveBeenCalledTimes(1);
    });

    it('should pin every wave to the start time of the first one', () => {
        const fixture = createFixture();

        fixture.componentInstance.loading.set(true);
        fixture.detectChanges();

        const [element, button] = getSkeletons(fixture);
        const firstWave = stubAnimation(element, 100);
        const laterWave = stubAnimation(button, 250);

        dispatchAnimationEvent(element, 'animationstart');
        dispatchAnimationEvent(button, 'animationstart');
        env.flushFrames();

        expect(firstWave.startTime).toBe(100);
        expect(laterWave.startTime).toBe(100);
    });

    it('should ignore other animations and the animations of descendants', () => {
        const fixture = createFixture();

        fixture.componentInstance.loading.set(true);
        fixture.detectChanges();

        const [, button] = getSkeletons(fixture);
        const otherAnimation = stubAnimation(button, 250, 'other');

        dispatchAnimationEvent(button, 'animationstart', 'other');
        dispatchAnimationEvent(button.querySelector('span')!, 'animationstart');
        env.flushFrames();

        expect(getOffset(button)).toBe('');
        expect(otherAnimation.startTime).toBe(250);
    });

    it('should stop the wave outside the viewport', () => {
        const [element] = getSkeletons(createFixture());

        expect(env.observed.has(element)).toBe(true);

        env.report(element, false);

        expect(element.classList).toContain(offscreenClass);

        env.report(element, true);

        expect(element.classList).not.toContain(offscreenClass);
    });

    it('should leave the wave once disabled', () => {
        const fixture = createFixture();
        const [, button] = getSkeletons(fixture);

        jest.spyOn(button, 'getBoundingClientRect').mockReturnValue({ left: 42 } as DOMRect);
        fixture.componentInstance.loading.set(true);
        fixture.detectChanges();
        dispatchAnimationEvent(button, 'animationiteration');
        env.flushFrames();
        env.report(button, false);

        fixture.componentInstance.loading.set(false);
        fixture.detectChanges();

        expect(env.observed.has(button)).toBe(false);
        expect(button.classList).not.toContain(offscreenClass);
        expect(getOffset(button)).toBe('');

        // An entry the observer queued before `unobserve` and the events of a wave that is still ending.
        env.report(button, false);
        dispatchAnimationEvent(button, 'animationiteration');
        env.flushFrames();

        expect(button.classList).not.toContain(offscreenClass);
        expect(getOffset(button)).toBe('');
    });

    it('should leave the wave once destroyed', () => {
        const fixture = createFixture();
        const [element] = getSkeletons(fixture);

        jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left: 42 } as DOMRect);
        dispatchAnimationEvent(element, 'animationiteration');
        env.flushFrames();
        fixture.destroy();

        expect(env.observed.has(element)).toBe(false);
        expect(getOffset(element)).toBe('');

        dispatchAnimationEvent(element, 'animationiteration');
        env.flushFrames();

        expect(getOffset(element)).toBe('');
    });

    it('should take a new start time once every skeleton leaves the wave', () => {
        const firstFixture = createFixture();
        const [firstElement] = getSkeletons(firstFixture);

        stubAnimation(firstElement, 100);
        dispatchAnimationEvent(firstElement, 'animationstart');
        env.flushFrames();
        firstFixture.destroy();

        const [element] = getSkeletons(createFixture());
        const wave = stubAnimation(element, 500);

        dispatchAnimationEvent(element, 'animationstart');
        env.flushFrames();

        expect(wave.startTime).toBe(500);
    });

    it('should keep the wave running where IntersectionObserver is missing', () => {
        TestBed.overrideProvider(KBQ_WINDOW, { useValue: { requestAnimationFrame: env.window.requestAnimationFrame } });

        const [element] = getSkeletons(createFixture());

        expect(env.observed.size).toBe(0);
        expect(element.classList).not.toContain(offscreenClass);
    });
});
