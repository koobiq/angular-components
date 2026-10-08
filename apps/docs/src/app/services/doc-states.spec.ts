import { DocsDocStates } from './doc-states';

/**
 * jsdom does not perform layout, so `scrollTop`/`offsetHeight` are hardcoded to 0 and are not
 * writable by default. This helper makes them mutable so overflow logic can be exercised.
 */
const createScrollable = (): HTMLElement => {
    const element = document.createElement('div');

    Object.defineProperty(element, 'scrollTop', { configurable: true, writable: true, value: 0 });
    Object.defineProperty(element, 'offsetHeight', { configurable: true, writable: true, value: 0 });

    return element;
};

describe(DocsDocStates.name, () => {
    let service: DocsDocStates;

    beforeEach(() => {
        vi.useFakeTimers();
        service = new DocsDocStates();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should not throw when scrollUp is called before any container is registered', () => {
        expect(() => service.scrollUp()).not.toThrow();
    });

    it('should not throw when checkHeaderOverflow runs before registration', () => {
        expect(() => service.checkHeaderOverflow()).not.toThrow();
    });

    it('should not throw when checkNavbarOverflow runs before registration', () => {
        expect(() => service.checkNavbarOverflow()).not.toThrow();
    });

    it('should stop reacting to scroll on the previous header container after re-registration', async () => {
        service.registerHeader(createScrollable());

        const first = createScrollable();
        const second = createScrollable();

        // Every viewer re-registers on navigation; only the latest container must stay subscribed.
        service.registerHeaderScrollContainer(first);
        service.registerHeaderScrollContainer(second);

        // Flush the `Promise.resolve().then(...)` initial checks queued by registration.
        await vi.advanceTimersByTimeAsync(0);

        const spy = vi.fn();

        service.viewerTopOverflown.subscribe(spy);
        spy.mockClear();

        // The detached previous container's subscription was torn down — its scroll is ignored.
        first.scrollTop = 500;
        first.dispatchEvent(new Event('scroll'));
        await vi.advanceTimersByTimeAsync(10);
        expect(spy).not.toHaveBeenCalled();

        // The current container still drives updates.
        second.scrollTop = 500;
        second.dispatchEvent(new Event('scroll'));
        await vi.advanceTimersByTimeAsync(10);
        expect(spy).toHaveBeenCalledWith(true);
    });

    it('should stop reacting to scroll on the previous navbar container after re-registration', async () => {
        const first = createScrollable();
        const second = createScrollable();

        service.registerNavbarScrollContainer(first);
        service.registerNavbarScrollContainer(second);

        const spy = vi.fn();

        service.navbarTopOverflown.subscribe(spy);
        spy.mockClear();

        first.scrollTop = 500;
        first.dispatchEvent(new Event('scroll'));
        await vi.advanceTimersByTimeAsync(10);
        expect(spy).not.toHaveBeenCalled();

        second.scrollTop = 500;
        second.dispatchEvent(new Event('scroll'));
        await vi.advanceTimersByTimeAsync(10);
        expect(spy).toHaveBeenCalledWith(true);
    });
});
