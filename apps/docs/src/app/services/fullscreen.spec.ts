import { TestBed } from '@angular/core/testing';
import { DocsFullscreenService } from './fullscreen';

describe(DocsFullscreenService.name, () => {
    let requestFullscreen: jest.Mock<Promise<void>>;
    let exitFullscreen: jest.Mock<Promise<void>>;

    const fullscreenEnabledDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenEnabled');
    const fullscreenElementDescriptor = Object.getOwnPropertyDescriptor(document, 'fullscreenElement');
    const exitFullscreenDescriptor = Object.getOwnPropertyDescriptor(document, 'exitFullscreen');
    const requestFullscreenDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'requestFullscreen');

    const setFullscreenElement = (element: Element | null): void => {
        Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
    };

    /** Instantiates the service and runs the render hook its initialization is deferred to. */
    const createService = (): DocsFullscreenService => {
        const service = TestBed.inject(DocsFullscreenService);

        TestBed.tick();

        return service;
    };

    beforeEach(() => {
        requestFullscreen = jest.fn().mockResolvedValue(undefined);
        exitFullscreen = jest.fn().mockResolvedValue(undefined);

        Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
        setFullscreenElement(null);
        Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exitFullscreen });
        Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
            configurable: true,
            value: requestFullscreen
        });

        TestBed.configureTestingModule({});
    });

    afterEach(() => {
        for (const [target, property, descriptor] of [
            [document, 'fullscreenEnabled', fullscreenEnabledDescriptor],
            [document, 'fullscreenElement', fullscreenElementDescriptor],
            [document, 'exitFullscreen', exitFullscreenDescriptor],
            [HTMLElement.prototype, 'requestFullscreen', requestFullscreenDescriptor]
        ] as const) {
            if (descriptor) {
                Object.defineProperty(target, property, descriptor);
            } else {
                Reflect.deleteProperty(target, property);
            }
        }
    });

    it('reports the Fullscreen API as available once the first render has happened', () => {
        expect(createService().available()).toBe(true);
    });

    // The capability is resolved in a render hook so that SSR markup, which cannot carry the
    // fullscreen controls, matches what hydration finds on the client.
    it('reports nothing as available before the first render', () => {
        expect(TestBed.inject(DocsFullscreenService).available()).toBe(false);
    });

    it('reports the Fullscreen API as unavailable when the document disallows it', () => {
        Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false });

        expect(createService().available()).toBe(false);
    });

    // iOS Safari exposes `fullscreenEnabled` but implements the request only for video elements.
    it('reports the Fullscreen API as unavailable without the element-level request', () => {
        Reflect.deleteProperty(HTMLElement.prototype, 'requestFullscreen');

        expect(createService().available()).toBe(false);
    });

    it('picks up an element that was already fullscreen before initialization', () => {
        const element = document.createElement('div');

        setFullscreenElement(element);

        expect(createService().element()).toBe(element);
    });

    it('tracks the fullscreen element across browser-driven transitions', () => {
        const service = createService();
        const element = document.createElement('div');

        expect(service.element()).toBeNull();

        setFullscreenElement(element);
        document.dispatchEvent(new Event('fullscreenchange'));

        expect(service.element()).toBe(element);

        setFullscreenElement(null);
        document.dispatchEvent(new Event('fullscreenchange'));

        expect(service.element()).toBeNull();
    });

    // The point of the service: an examples page holds dozens of viewers, and each one used to add
    // its own document listener.
    it('subscribes to fullscreenchange once no matter how many consumers inject it', () => {
        const addEventListener = jest.spyOn(document, 'addEventListener');

        createService();
        TestBed.inject(DocsFullscreenService);
        TestBed.inject(DocsFullscreenService);
        TestBed.tick();

        expect(addEventListener.mock.calls.filter(([type]) => type === 'fullscreenchange')).toHaveLength(1);

        addEventListener.mockRestore();
    });

    it('requests fullscreen for the element it is given', async () => {
        const element = document.createElement('div');

        await createService().toggle(element);

        expect(requestFullscreen).toHaveBeenCalledTimes(1);
        expect(requestFullscreen.mock.contexts[0]).toBe(element);
        expect(exitFullscreen).not.toHaveBeenCalled();
    });

    it('leaves fullscreen when the element it is given is the fullscreen element', async () => {
        const element = document.createElement('div');
        const service = createService();

        setFullscreenElement(element);

        await service.toggle(element);

        expect(exitFullscreen).toHaveBeenCalledTimes(1);
        expect(requestFullscreen).not.toHaveBeenCalled();
    });

    // A rejected request (a policy-blocked iframe, a gesture-less call) must not surface as an
    // unhandled rejection in the page the docs are embedded in.
    it('reports a rejected request instead of propagating it', async () => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => {});
        const reason = new Error('denied');

        requestFullscreen.mockRejectedValue(reason);

        await expect(createService().toggle(document.createElement('div'))).resolves.toBeUndefined();
        expect(error).toHaveBeenCalledWith('Could not toggle fullscreen mode', reason);

        error.mockRestore();
    });
});
