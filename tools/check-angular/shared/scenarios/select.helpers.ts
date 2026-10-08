import { ComponentFixture } from '@angular/core/testing';
import { DOWN_ARROW, ENTER, ESCAPE, LEFT_ARROW, RIGHT_ARROW, SPACE, TAB, UP_ARROW } from '@koobiq/components/core';

const KEY_CODES = {
    Enter: ENTER,
    ' ': SPACE,
    Escape: ESCAPE,
    Tab: TAB,
    ArrowDown: DOWN_ARROW,
    ArrowUp: UP_ARROW,
    ArrowLeft: LEFT_ARROW,
    ArrowRight: RIGHT_ARROW
};

export type Key = keyof typeof KEY_CODES;

/**
 * jsdom implements no scrolling, and the panels scroll their option list through `CdkScrollable`, which
 * calls `Element.scrollTo`. Registers the missing method for the enclosing `describe`.
 */
export function stubElementScrollTo(): void {
    let stubbed = false;

    beforeAll(() => {
        if ('scrollTo' in Element.prototype) return;

        Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, writable: true, value: () => {} });
        stubbed = true;
    });

    afterAll(() => {
        if (stubbed) delete (Element.prototype as Partial<Element>).scrollTo;
    });
}

/**
 * Waits for the render, one macrotask and the render after it: the selects close on an outside click and
 * focus their options through timers, which `whenStable()` does not wait for.
 */
export async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve));
    await fixture.whenStable();
}

/** Presses a key on the focused element, the way a keyboard does, and waits for the result. */
export async function press(
    fixture: ComponentFixture<unknown>,
    key: Key,
    modifiers: { altKey?: boolean } = {}
): Promise<KeyboardEvent> {
    const event = new KeyboardEvent('keydown', {
        key,
        keyCode: KEY_CODES[key],
        bubbles: true,
        cancelable: true,
        ...modifiers
    });

    focusedElement().dispatchEvent(event);
    await settle(fixture);

    return event;
}

/** Clicks an element and waits for the result. */
export async function click(fixture: ComponentFixture<unknown>, element: Element): Promise<void> {
    (element as HTMLElement).click();
    await settle(fixture);
}

/** Focuses an element and waits for the result. */
export async function focus(fixture: ComponentFixture<unknown>, element: Element): Promise<void> {
    (element as HTMLElement).focus();
    await settle(fixture);
}

export function focusedElement(): Element {
    return document.activeElement ?? document.body;
}

export function byTestId(fixture: ComponentFixture<unknown>, testId: string): HTMLElement {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`[data-testid="${testId}"]`);

    if (!element) throw new Error(`No element with data-testid="${testId}"`);

    return element;
}

export function text(element: Element | null | undefined): string {
    return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

/** The container the panels render into, outside the fixture. */
export function overlayContainer(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.cdk-overlay-container');
}

/** Fails a test of the enclosing `describe` that logs an error or a warning, such as an NG0100 in dev mode. */
export function failOnConsole(): void {
    let error: ReturnType<typeof vi.spyOn>;
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        error = vi.spyOn(console, 'error');
        warn = vi.spyOn(console, 'warn');
    });

    afterEach(() => {
        expect(error).not.toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
        error.mockRestore();
        warn.mockRestore();
    });
}
