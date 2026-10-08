import { ComponentFixture } from '@angular/core/testing';
import { ESCAPE, typeInElement } from '@koobiq/components/core';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { SidepanelScenario } from './sidepanel';

/** How long `KbqModalComponent` animates opening and closing, on a timer. */
const MODAL_ANIMATION = 300;

const byTestId = <T extends HTMLElement = HTMLElement>(root: ParentNode, id: string): T => {
    const element = root.querySelector<T>(`[data-testid="${id}"]`);

    if (!element) throw new Error(`No element with data-testid="${id}"`);

    return element;
};

const inOverlay = <T extends Element = HTMLElement>(selector: string): T | null =>
    document.querySelector<T>(`.cdk-overlay-container ${selector}`);

/** Focuses the opener, as a pointer or the keyboard would, then activates it. */
const activate = (opener: HTMLElement): void => {
    opener.focus();
    opener.click();
};

// The event constructor rather than `dispatchKeyboardEvent`, which throws in this runner's jsdom environment.
const pressEscape = (): void => {
    (document.activeElement ?? document.body).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', keyCode: ESCAPE, bubbles: true, cancelable: true })
    );
};

const expectOverlayDetached = (): void => {
    expect(inOverlay('.cdk-overlay-pane')).toBeNull();
    expect(inOverlay('.cdk-overlay-backdrop')).toBeNull();
    expect(document.querySelector('kbq-sidepanel-container')).toBeNull();
    expect(document.querySelector('kbq-modal')).toBeNull();
};

/**
 * jsdom has no layout, and the CDK focus trap only moves focus to an element that has some: without this the
 * sidepanel would never take focus.
 */
const giveElementsGeometry = (): void => {
    const nativeGetClientRects = Element.prototype.getClientRects;

    beforeEach(() => {
        Element.prototype.getClientRects = () => [{}] as unknown as DOMRectList;
    });

    afterEach(() => {
        Element.prototype.getClientRects = nativeGetClientRects;
    });
};

export function defineSidepanelSuite(config: CheckConfig): void {
    describe(`sidepanel (${config.name})`, () => {
        giveElementsGeometry();

        let fixture: ComponentFixture<SidepanelScenario>;
        let opener: HTMLButtonElement;

        const openDetails = async (): Promise<HTMLElement> => {
            fixture = await renderScenario(SidepanelScenario, config);
            opener = byTestId(fixture.nativeElement, 'open-details');

            activate(opener);
            await fixture.whenStable();

            return document.querySelector<HTMLElement>('kbq-sidepanel-container')!;
        };

        it('opens with its data, takes focus, reports afterOpened and hides the page from assistive technology', async () => {
            const panel = await openDetails();

            expect(panel).not.toBeNull();
            expect(panel.getAttribute('role')).toBe('dialog');
            expect(panel.getAttribute('aria-modal')).toBe('true');
            expect(document.getElementById(panel.getAttribute('aria-labelledby')!)?.textContent?.trim()).toBe(
                'Ada Lovelace'
            );
            expect(byTestId(panel, 'details-email').textContent).toBe('ada@example.com');
            expect(byTestId<HTMLInputElement>(panel, 'details-role').value).toBe('Analyst');

            expect(document.activeElement).toBe(byTestId(panel, 'details-role'));
            expect(fixture.componentInstance.events()).toEqual(['details opened']);
            expect(fixture.nativeElement.closest('[aria-hidden="true"]')).not.toBeNull();
        });

        it('closes with the result of the save button, returns focus and detaches the overlay', async () => {
            const panel = await openDetails();

            typeInElement('Lead analyst', byTestId<HTMLInputElement>(panel, 'details-role'));
            await fixture.whenStable();

            byTestId(panel, 'details-save').click();
            await fixture.whenStable();

            expect(fixture.componentInstance.events()).toEqual(['details opened', 'details closed: Lead analyst']);
            expect(byTestId(fixture.nativeElement, 'employee-role').textContent).toBe('Lead analyst');
            expect(document.activeElement).toBe(opener);
            expectOverlayDetached();
            expect(fixture.nativeElement.closest('[aria-hidden="true"]')).toBeNull();
        });

        it('closes without a result on Escape', async () => {
            await openDetails();

            pressEscape();
            await fixture.whenStable();

            expect(fixture.componentInstance.events()).toEqual(['details opened', 'details closed: nothing']);
            expect(byTestId(fixture.nativeElement, 'employee-role').textContent).toBe('Analyst');
            expect(document.activeElement).toBe(opener);
            expectOverlayDetached();
        });

        it('closes without a result on a backdrop click', async () => {
            await openDetails();

            const backdrop = inOverlay<HTMLElement>('.cdk-overlay-backdrop');

            expect(backdrop).not.toBeNull();

            backdrop!.click();
            await fixture.whenStable();

            expect(fixture.componentInstance.events()).toEqual(['details opened', 'details closed: nothing']);
            expect(document.activeElement).toBe(opener);
            expectOverlayDetached();
        });

        it('closes through the header close button', async () => {
            const panel = await openDetails();

            panel.querySelector<HTMLButtonElement>('.kbq-sidepanel-header .kbq-sidepanel-close')!.click();
            await fixture.whenStable();

            expect(fixture.componentInstance.events()).toEqual(['details opened', 'details closed: nothing']);
            expect(document.activeElement).toBe(opener);
            expectOverlayDetached();
        });

        it('opens a template without a backdrop and closes it through kbq-sidepanel-close with a result', async () => {
            fixture = await renderScenario(SidepanelScenario, config);

            const helpOpener = byTestId<HTMLButtonElement>(fixture.nativeElement, 'open-help');

            activate(helpOpener);
            await fixture.whenStable();

            const panel = document.querySelector<HTMLElement>('kbq-sidepanel-container')!;

            expect(panel.querySelector('.kbq-sidepanel-header')?.textContent?.trim()).toBe('Help: roles');
            expect(panel.getAttribute('aria-modal')).toBeNull();
            expect(inOverlay('.cdk-overlay-backdrop')).toBeNull();
            expect(fixture.nativeElement.closest('[aria-hidden="true"]')).toBeNull();
            expect(panel.contains(document.activeElement)).toBe(true);
            expect(fixture.componentInstance.events()).toEqual(['help opened']);

            byTestId(panel, 'help-read').click();
            await fixture.whenStable();

            expect(fixture.componentInstance.events()).toEqual(['help opened', 'help closed: read']);
            expect(document.activeElement).toBe(helpOpener);
            expectOverlayDetached();
        });
    });

    describe(`modal (${config.name})`, () => {
        let fixture: ComponentFixture<SidepanelScenario>;
        let opener: HTMLButtonElement;

        // The modal animates on a timer, and with every timer faked `whenStable()` would wait on a faked one too.
        const settle = async (ms = 0): Promise<void> => {
            await vi.advanceTimersByTimeAsync(ms);
            fixture.detectChanges();
        };

        const openModal = async (): Promise<HTMLElement> => {
            fixture = await renderScenario(SidepanelScenario, config);
            opener = byTestId(fixture.nativeElement, 'open-delete');

            vi.useFakeTimers();

            activate(opener);
            await settle(MODAL_ANIMATION);

            return document.querySelector<HTMLElement>('kbq-modal')!;
        };

        afterEach(() => vi.useRealTimers());

        it('opens with the options written into it, the content component and its data', async () => {
            const modal = await openModal();

            expect(modal).not.toBeNull();
            expect(modal.querySelector('.kbq-modal-title')?.textContent?.trim()).toBe('Delete employee');
            expect(byTestId(modal, 'delete-question').textContent).toBe('Delete Ada Lovelace?');

            const ok = modal.querySelector<HTMLButtonElement>('.kbq-modal-footer button[autofocus]');

            expect(ok?.textContent?.trim()).toBe('Delete');
            expect(document.activeElement).toBe(ok);
            expect(fixture.componentInstance.events()).toEqual(['delete opened']);
        });

        it('runs kbqOnOk with the content component on OK, then closes and emits afterClose', async () => {
            const modal = await openModal();

            byTestId(modal, 'delete-reports').querySelector('input')!.click();
            await settle();

            modal.querySelector<HTMLButtonElement>('.kbq-modal-footer button[autofocus]')!.click();
            await settle();

            expect(fixture.componentInstance.events()).toEqual(['delete opened', 'delete confirmed, reports: true']);

            await settle(MODAL_ANIMATION);

            expect(fixture.componentInstance.events()).toEqual([
                'delete opened',
                'delete confirmed, reports: true',
                'delete closed'
            ]);
            expect(byTestId(fixture.nativeElement, 'employee-deleted')).not.toBeNull();
            expect(document.activeElement).toBe(opener);
            expectOverlayDetached();
            expect(document.querySelector('.kbq-modal-overlay')).toBeNull();
        });

        it('closes on Escape through kbqOnCancel', async () => {
            await openModal();

            pressEscape();
            await settle(MODAL_ANIMATION);

            expect(fixture.componentInstance.events()).toEqual(['delete opened', 'delete cancelled', 'delete closed']);
            expect(fixture.nativeElement.querySelector('[data-testid="employee-deleted"]')).toBeNull();
            expect(document.activeElement).toBe(opener);
            expectOverlayDetached();
            expect(document.querySelector('.kbq-modal-overlay')).toBeNull();
        });
    });
}
