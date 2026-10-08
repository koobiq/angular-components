import { Overlay, OverlayConfig, OverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApplicationRef, ChangeDetectionStrategy, Component, PLATFORM_ID, Provider, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KBQ_OVERLAY_LAYERS, KbqOverlayLayer, KbqOverlayLayerExclude, KbqOverlayLayers } from '@koobiq/components/core';

@Component({
    template: '<button>Panel action</button>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class PanelContent {}

@Component({
    imports: [KbqOverlayLayer, KbqOverlayLayerExclude],
    template: `
        <button id="outside">Outside</button>
        @if (hasLayer()) {
            <main kbqOverlayLayer>
                <button id="inside">Inside</button>
                <section kbqOverlayLayer>
                    <button id="nested">Nested</button>
                </section>
                <div class="cdk-overlay-container">
                    <button id="scoped">Scoped</button>
                </div>
                <header kbqOverlayLayerExclude>
                    <button id="excluded">Excluded</button>
                </header>
            </main>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly hasLayer = signal(true);
}

describe('KbqOverlayLayer', () => {
    let fixture: ComponentFixture<TestApp>;
    let overlay: Overlay;
    let layers: KbqOverlayLayers;
    let root: HTMLElement;
    let overlayRefs: OverlayRef[];

    function setup(providers: Provider[] = []): void {
        TestBed.configureTestingModule({ providers });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        overlay = TestBed.inject(Overlay);
        layers = TestBed.inject(KBQ_OVERLAY_LAYERS);
        root = TestBed.inject(OverlayContainer).getContainerElement();
        overlayRefs = [];
    }

    function element(selector: string): HTMLElement {
        return fixture.nativeElement.querySelector(selector);
    }

    function layerOf(selector: string): HTMLElement | null {
        return element(selector).querySelector(':scope > .kbq-overlay-layer');
    }

    function createOverlay(config?: OverlayConfig): OverlayRef {
        const overlayRef = overlay.create(config);

        overlayRefs.push(overlayRef);

        return overlayRef;
    }

    function attach(overlayRef: OverlayRef): void {
        overlayRef.attach(new ComponentPortal(PanelContent));
    }

    function detach(overlayRef: OverlayRef): void {
        overlayRef.detach();
        // CDK removes the detached host on the next render.
        TestBed.inject(ApplicationRef).tick();
    }

    afterEach(() => overlayRefs.forEach((overlayRef) => overlayRef.dispose()));

    describe('in the browser', () => {
        beforeEach(() => setup());

        it('creates the layer inside the element with the first adopted panel', () => {
            const overlayRef = createOverlay();

            expect(layerOf('main')).toBeNull();

            layers.adopt(overlayRef, element('#inside'));

            const layer = layerOf('main')!;

            expect(layer.classList).toContain('cdk-overlay-container');
            expect(overlayRef.hostElement.parentElement).toBe(layer);
        });

        it('keeps a panel opened from outside every layer in the application-wide container', () => {
            const overlayRef = createOverlay();

            layers.adopt(overlayRef, element('#outside'));

            expect(overlayRef.hostElement.parentElement).toBe(root);
            expect(layerOf('main')).toBeNull();
        });

        it('keeps a panel without an origin in the application-wide container', () => {
            const overlayRef = createOverlay();

            layers.adopt(overlayRef, () => null);

            expect(overlayRef.hostElement.parentElement).toBe(root);
        });

        it('puts a panel opened from a layered panel on top of it in the same layer', () => {
            const parentRef = createOverlay();

            layers.adopt(parentRef, element('#inside'));
            attach(parentRef);

            const childRef = createOverlay();

            layers.adopt(childRef, parentRef.overlayElement.querySelector('button')!);

            expect(childRef.hostElement.parentElement).toBe(layerOf('main'));
            expect(childRef.hostElement.previousElementSibling).toBe(parentRef.hostElement);
        });

        it('puts a panel into the innermost layer that contains its origin', () => {
            const overlayRef = createOverlay();

            layers.adopt(overlayRef, element('#nested'));

            expect(overlayRef.hostElement.parentElement).toBe(layerOf('section'));
        });

        it('keeps a panel opened from an overlay container inside the element in the application-wide container', () => {
            const overlayRef = createOverlay();

            layers.adopt(overlayRef, element('#scoped'));

            expect(overlayRef.hostElement.parentElement).toBe(root);
        });

        it('keeps a panel opened from an excluded element inside the element in the application-wide container', () => {
            const overlayRef = createOverlay();

            layers.adopt(overlayRef, element('#excluded'));

            expect(overlayRef.hostElement.parentElement).toBe(root);
        });

        it('leaves a host placed by another overlay container alone', () => {
            const overlayRef = createOverlay();
            const otherContainer = document.createElement('div');

            otherContainer.appendChild(overlayRef.hostElement);
            layers.adopt(overlayRef, element('#inside'));

            expect(overlayRef.hostElement.parentElement).toBe(otherContainer);
        });

        it('reads the origin getter again on every attach', () => {
            const overlayRef = createOverlay();
            let origin: HTMLElement | null = null;

            layers.adopt(overlayRef, () => origin);
            attach(overlayRef);

            expect(overlayRef.hostElement.parentElement).toBe(root);

            detach(overlayRef);
            origin = element('#inside');
            attach(overlayRef);

            expect(overlayRef.hostElement.parentElement).toBe(layerOf('main'));
        });

        it('subscribes once when the same overlay is adopted repeatedly', () => {
            const overlayRef = createOverlay();
            const getOrigin = vi.fn(() => element('#inside'));

            layers.adopt(overlayRef, getOrigin);
            layers.adopt(overlayRef, getOrigin);
            getOrigin.mockClear();
            attach(overlayRef);

            expect(getOrigin).toHaveBeenCalledTimes(1);
        });

        it('keeps the backdrop right before its host', () => {
            const overlayRef = createOverlay({ hasBackdrop: true });

            attach(overlayRef);
            layers.adopt(overlayRef, element('#inside'));

            expect(overlayRef.hostElement.parentElement).toBe(layerOf('main'));
            expect(overlayRef.hostElement.previousElementSibling).toBe(overlayRef.backdropElement);
        });

        it('re-attaches a detached panel into its layer', () => {
            const overlayRef = createOverlay();

            layers.adopt(overlayRef, element('#inside'));
            attach(overlayRef);
            detach(overlayRef);

            expect(overlayRef.hostElement.isConnected).toBe(false);

            attach(overlayRef);

            expect(overlayRef.hostElement.parentElement).toBe(layerOf('main'));
        });

        it('re-attaches a panel into the application-wide container once its layer is destroyed', () => {
            const overlayRef = createOverlay();

            layers.adopt(overlayRef, element('#inside'));
            attach(overlayRef);
            detach(overlayRef);

            fixture.componentInstance.hasLayer.set(false);
            fixture.detectChanges();
            attach(overlayRef);

            expect(overlayRef.hostElement.parentElement).toBe(root);
        });

        it('keeps a panel in the application-wide container while an element outside the layer is fullscreen', () => {
            const overlayRef = createOverlay();

            Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element('#outside') });

            try {
                layers.adopt(overlayRef, element('#inside'));
            } finally {
                delete (document as { fullscreenElement?: Element }).fullscreenElement;
            }

            expect(overlayRef.hostElement.parentElement).toBe(root);
        });
    });

    describe('with overlays shown as popovers', () => {
        // jsdom has no Popover API, and CDK shows an overlay as a popover only where `showPopover` exists.
        const shown = new Set<HTMLElement>();

        beforeEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'showPopover', {
                configurable: true,
                value(this: HTMLElement) {
                    if (!this.hasAttribute('popover')) throw new DOMException('Not a popover', 'NotSupportedError');

                    shown.add(this);
                }
            });
            Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
                configurable: true,
                value(this: HTMLElement) {
                    shown.delete(this);
                }
            });
            setup();
        });

        afterEach(() => {
            delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
            delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
            shown.clear();
        });

        it('takes a panel moved into a layer out of the top layer, where the layer could not cover it', () => {
            const overlayRef = createOverlay({ hasBackdrop: true });
            const host = overlayRef.hostElement;

            attach(overlayRef);

            expect(shown.has(host)).toBe(true);

            layers.adopt(overlayRef, element('#inside'));

            expect(host.parentElement).toBe(layerOf('main'));
            expect(shown.has(host)).toBe(false);
            expect(host.hasAttribute('popover')).toBe(false);
            expect(host.classList).not.toContain('cdk-overlay-popover');
            expect(host.previousElementSibling).toBe(overlayRef.backdropElement);
        });

        it('returns a panel moved back to the application-wide container to the top layer', () => {
            const overlayRef = createOverlay({ hasBackdrop: true });
            const host = overlayRef.hostElement;
            let origin = element('#inside');

            layers.adopt(overlayRef, () => origin);
            attach(overlayRef);
            detach(overlayRef);
            origin = element('#outside');
            attach(overlayRef);

            expect(host.parentElement).toBe(root);
            expect(shown.has(host)).toBe(true);
            expect(host.getAttribute('popover')).toBe('manual');
            expect(host.classList).toContain('cdk-overlay-popover');
            expect(host.firstElementChild).toBe(overlayRef.backdropElement);
        });
    });

    it('leaves panels in place outside the browser', () => {
        setup([{ provide: PLATFORM_ID, useValue: 'server' }]);

        const overlayRef = createOverlay();
        const parent = overlayRef.hostElement.parentElement;

        layers.adopt(overlayRef, element('#inside'));

        expect(overlayRef.hostElement.parentElement).toBe(parent);
        expect(layerOf('main')).toBeNull();
    });
});
