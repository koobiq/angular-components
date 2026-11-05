import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { dispatchFakeEvent, dispatchKeyboardEvent, ENTER } from '@koobiq/components/core';
import { EXAMPLE_COMPONENTS, type LiveExample } from '@koobiq/docs-examples';
import { DocsStackblitzButtonComponent } from './stackblitz-button';
import { DocsStackblitzWriter } from './stackblitz-writer';

const EXAMPLE_ID = 'basic-button-example';

describe(DocsStackblitzButtonComponent.name, () => {
    let fixture: ComponentFixture<DocsStackblitzButtonComponent>;
    let createStackBlitzForExample: Mock<DocsStackblitzWriter['createStackBlitzForExample']>;
    let open: Mock<() => void>;
    let resolveProject: (open: () => void) => void;

    const link = (): HTMLElement => fixture.nativeElement.querySelector('[kbqLink]');

    beforeEach(() => {
        EXAMPLE_COMPONENTS[EXAMPLE_ID] = {} as LiveExample;
        open = vi.fn();

        // The writer caches the project of an example, so every call returns the same promise.
        const project = new Promise<() => void>((resolve) => (resolveProject = resolve));

        createStackBlitzForExample = vi.fn(() => project);

        TestBed.configureTestingModule({
            providers: [{ provide: DocsStackblitzWriter, useValue: { createStackBlitzForExample } }]
        });

        fixture = TestBed.createComponent(DocsStackblitzButtonComponent);
        fixture.componentRef.setInput('exampleId', EXAMPLE_ID);
        fixture.detectChanges();
    });

    afterEach(() => {
        delete EXAMPLE_COMPONENTS[EXAMPLE_ID];
    });

    it('loads the files of the example on hover and on focus, before the click', () => {
        dispatchFakeEvent(link(), 'pointerenter');
        dispatchFakeEvent(link(), 'focus');

        expect(createStackBlitzForExample).toHaveBeenCalledTimes(2);
        expect(createStackBlitzForExample.mock.calls[0][0]).toBe(EXAMPLE_ID);
        expect(open).not.toHaveBeenCalled();
    });

    it('opens a prepared project within the click, which Firefox lets open a tab', async () => {
        dispatchFakeEvent(link(), 'pointerenter');
        resolveProject(open);
        await fixture.whenStable();

        link().click();

        expect(open).toHaveBeenCalledTimes(1);
    });

    it('opens a prepared project once for a double click or a held key', async () => {
        dispatchFakeEvent(link(), 'pointerenter');
        resolveProject(open);
        await fixture.whenStable();

        link().dispatchEvent(new MouseEvent('click', { detail: 1 }));
        link().dispatchEvent(new MouseEvent('click', { detail: 2 }));
        link().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true }));

        expect(open).toHaveBeenCalledTimes(1);
    });

    it('opens one project however many times it is clicked while the files load', async () => {
        link().click();
        link().click();
        dispatchKeyboardEvent(link(), 'keydown', ENTER, undefined, 'Enter');
        fixture.detectChanges();

        expect(link().getAttribute('aria-disabled')).toBe('true');

        resolveProject(open);
        await vi.waitFor(() => expect(open).toHaveBeenCalled());
        await fixture.whenStable();

        expect(open).toHaveBeenCalledTimes(1);
        expect(link().hasAttribute('aria-disabled')).toBe(false);
    });

    it('makes the link active again after the click failed to load the files, so the next click retries', async () => {
        createStackBlitzForExample.mockReturnValueOnce(Promise.reject(new Error('offline')));

        link().click();
        fixture.detectChanges();

        expect(link().getAttribute('aria-disabled')).toBe('true');

        await vi.waitFor(() => {
            fixture.detectChanges();
            expect(link().hasAttribute('aria-disabled')).toBe(false);
        });

        link().click();
        resolveProject(open);
        await vi.waitFor(() => expect(open).toHaveBeenCalled());

        expect(createStackBlitzForExample).toHaveBeenCalledTimes(2);
    });

    it('loads the files again on the click after the hover failed to load them', async () => {
        createStackBlitzForExample.mockReturnValueOnce(Promise.reject(new Error('offline')));

        dispatchFakeEvent(link(), 'pointerenter');
        await fixture.whenStable();

        link().click();
        resolveProject(open);
        await vi.waitFor(() => expect(open).toHaveBeenCalled());

        expect(createStackBlitzForExample).toHaveBeenCalledTimes(2);
    });
});
