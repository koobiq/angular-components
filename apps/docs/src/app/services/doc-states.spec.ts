import type { KbqScrollbar, KbqScrollbarScrollChangeEvent } from '@koobiq/components/scrollbar';
import { Subject } from 'rxjs';
import { DocsDocStates } from './doc-states';

/**
 * jsdom does not perform layout, so `offsetHeight` is hardcoded to 0 and is not writable by
 * default. This helper makes it mutable so the header-overflow threshold can be exercised.
 */
const createHeader = (offsetHeight = 0): HTMLElement => {
    const element = document.createElement('div');

    Object.defineProperty(element, 'offsetHeight', { configurable: true, writable: true, value: offsetHeight });

    return element;
};

const createScrollElement = (scrollTop = 0): HTMLElement => {
    const element = document.createElement('div');

    Object.defineProperty(element, 'scrollTop', { configurable: true, writable: true, value: scrollTop });

    return element;
};

/** Minimal `KbqScrollbar` stand-in — only the members `DocsDocStates` actually reads. */
const createScrollbarStub = (scrollElement: HTMLElement | null = null) => {
    const scrollChange = new Subject<KbqScrollbarScrollChangeEvent>();
    let topReached = true;

    const scrollbar = {
        scrollChange,
        scrollToTop: jest.fn(),
        getScrollElement: () => scrollElement,
        isTopReached: () => topReached
    } as unknown as KbqScrollbar;

    return {
        scrollbar,
        scrollChange,
        setTopReached: (value: boolean) => {
            topReached = value;
        }
    };
};

describe(DocsDocStates.name, () => {
    let service: DocsDocStates;

    beforeEach(() => {
        service = new DocsDocStates();
    });

    it('should not throw when scrollUp is called before any container is registered', () => {
        expect(() => service.scrollUp()).not.toThrow();
    });

    it('should not throw registering a scroll container before a header element is registered', () => {
        expect(() => service.registerHeaderScrollContainer(createScrollbarStub().scrollbar)).not.toThrow();
    });

    it('delegates scrollUp() to the most recently registered scrollbar', () => {
        const first = createScrollbarStub();
        const second = createScrollbarStub();

        service.registerHeaderScrollContainer(first.scrollbar);
        service.registerHeaderScrollContainer(second.scrollbar);

        service.scrollUp();

        expect(first.scrollbar.scrollToTop).not.toHaveBeenCalled();
        expect(second.scrollbar.scrollToTop).toHaveBeenCalled();
    });

    it("checks overflow immediately against the registered scrollbar's current state", () => {
        service.registerHeader(createHeader(100));

        const stub = createScrollbarStub(createScrollElement(200));

        stub.setTopReached(false);
        service.registerHeaderScrollContainer(stub.scrollbar);

        expect(service.isHeaderOverflown).toBe(true);

        const spy = jest.fn();

        service.viewerTopOverflown.subscribe(spy);
        expect(spy).toHaveBeenCalledWith(true);
    });

    it("updates isHeaderOverflown/viewerTopOverflown from the registered scrollbar's scrollChange", () => {
        service.registerHeader(createHeader(100));

        const { scrollbar, scrollChange, setTopReached } = createScrollbarStub();

        service.registerHeaderScrollContainer(scrollbar);

        const spy = jest.fn();

        service.viewerTopOverflown.subscribe(spy);
        spy.mockClear();

        setTopReached(false);
        scrollChange.next({ top: 50, left: 0 });
        expect(service.isHeaderOverflown).toBe(false);
        expect(spy).toHaveBeenCalledWith(true);

        scrollChange.next({ top: 150, left: 0 });
        expect(service.isHeaderOverflown).toBe(true);
    });

    it('only the most recently registered scrollbar drives overflow updates', () => {
        service.registerHeader(createHeader(0));

        const first = createScrollbarStub();
        const second = createScrollbarStub();

        service.registerHeaderScrollContainer(first.scrollbar);
        service.registerHeaderScrollContainer(second.scrollbar);

        const spy = jest.fn();

        service.viewerTopOverflown.subscribe(spy);
        spy.mockClear();

        second.setTopReached(false);
        second.scrollChange.next({ top: 50, left: 0 });

        expect(spy).toHaveBeenCalledWith(true);
    });
});
