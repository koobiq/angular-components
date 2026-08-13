import { BrowserContext, Page } from '@playwright/test';

/**
 * Puts the element matching `selector` into `:autofill` for the duration of the test.
 *
 * The browser's own autofill cannot be triggered from a test: picking a suggestion happens in browser
 * chrome, and the CDP `Autofill` domain that would do it is compiled into Chrome-branded builds only —
 * `Schema.getDomains` on the Chromium Playwright bundles does not list it, so `Autofill.enable` fails
 * with "wasn't found". `CSS.forcePseudoState` is the way in: it forces the pseudo-class at style
 * resolution, `:has()` invalidates on it, and `Element.matches()` reports it.
 *
 * The forced state is enough to make Chrome apply its own autofill background too, so this covers the
 * suppression of the UA styling as well, not only the selectors: read the control's `background-color`
 * and it is Chrome's `rgb(232, 240, 254)` held at alpha 0. What it does not reproduce is the fill
 * itself — no value is written and no `animationstart` fires, so `AutofillMonitor` stays quiet and
 * `kbq-form-field_autofilled` is not added. Fake that class separately when the TypeScript-driven half
 * is what is under test.
 *
 * Only the standard `autofill` spelling is accepted; passing `-webkit-autofill` silently forces nothing.
 * Forcing replaces whatever was forced on that node before, so one call has to carry every pseudo-class
 * the node needs.
 *
 * The session is deliberately left attached: the forced state lives with it, and detaching drops the
 * pseudo-class again — silently, which turns every assertion after it into a test that passes because
 * nothing is being styled. Playwright disposes the session when the context closes.
 */
export const e2eForceAutofill = async (page: Page, context: BrowserContext, selector: string): Promise<void> => {
    const session = await context.newCDPSession(page);

    await session.send('DOM.enable');
    await session.send('CSS.enable');

    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });

    if (!nodeId) {
        throw new Error(`e2eForceAutofill: nothing matches ${selector}`);
    }

    await session.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['autofill'] });
};
