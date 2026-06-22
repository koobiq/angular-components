import { OverlayContainer } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    KbqShadowDomOverlayContainer,
    KbqShadowDomOverlayHost,
    kbqShadowDomOverlayProvider
} from '@koobiq/components/core';

describe('KbqShadowDomOverlayContainer', () => {
    const cleanups: (() => void)[] = [];

    /** Creates an element with an attached open shadow root, appended to the document body. */
    function createOpenShadowHost(): HTMLElement {
        const host = document.createElement('div');

        document.body.appendChild(host);
        host.attachShadow({ mode: 'open' });
        cleanups.push(() => host.remove());

        return host;
    }

    function setup(host?: KbqShadowDomOverlayHost): KbqShadowDomOverlayContainer {
        TestBed.configureTestingModule({
            providers: host === undefined ? kbqShadowDomOverlayProvider() : kbqShadowDomOverlayProvider(host)
        });

        const container = TestBed.inject(OverlayContainer) as KbqShadowDomOverlayContainer;

        cleanups.push(() => container.ngOnDestroy());

        return container;
    }

    afterEach(() => {
        cleanups.splice(0).forEach((cleanup) => cleanup());
    });

    it('relocates the container into the shadow root when the host is the shadow host element', () => {
        const host = createOpenShadowHost();
        const container = setup(host);

        expect(container.getContainerElement().getRootNode()).toBe(host.shadowRoot);
    });

    it('accepts the host as an ElementRef', () => {
        const host = createOpenShadowHost();
        const container = setup(new ElementRef(host));

        expect(container.getContainerElement().getRootNode()).toBe(host.shadowRoot);
    });

    it('accepts the host as a getter resolved lazily at first overlay', () => {
        const host = createOpenShadowHost();
        const container = setup(() => host);

        expect(container.getContainerElement().getRootNode()).toBe(host.shadowRoot);
    });

    it('resolves the shadow root from an element that already lives inside the shadow tree', () => {
        const host = createOpenShadowHost();
        const inner = document.createElement('div');

        host.shadowRoot!.appendChild(inner);

        const container = setup(inner);

        expect(container.getContainerElement().getRootNode()).toBe(host.shadowRoot);
    });

    it('keeps the container on document.body when the host is not inside a shadow root', () => {
        const host = document.createElement('div');

        document.body.appendChild(host);
        cleanups.push(() => host.remove());

        const container = setup(host);

        expect(container.getContainerElement().getRootNode()).toBe(document);
        expect(document.body.contains(container.getContainerElement())).toBe(true);
    });

    it('keeps the container on document.body when no host is provided and no root component is in a shadow root', () => {
        const container = setup();

        expect(container.getContainerElement().getRootNode()).toBe(document);
    });

    it('delivers the CDK structural overlay styles into the shadow root', () => {
        const sourceStyle = document.createElement('style');

        sourceStyle.textContent = '.cdk-overlay-pane { position: absolute; }';
        document.head.appendChild(sourceStyle);
        cleanups.push(() => sourceStyle.remove());

        const host = createOpenShadowHost();
        const container = setup(host);

        container.getContainerElement();

        const delivered = host.shadowRoot!.querySelector('style[data-kbq-overlay-structural-styles]');

        expect(delivered).not.toBeNull();
        expect(delivered!.textContent).toContain('.cdk-overlay-pane');
    });

    it('warns when an explicit host does not resolve to an open shadow root', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const container = setup(() => null);

        container.getContainerElement();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('did not resolve to an open shadow root'));
        expect(container.getContainerElement().getRootNode()).toBe(document);

        warn.mockRestore();
    });
});
