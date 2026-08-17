import { CDPSession, Locator, Page } from '@playwright/test';

/**
 * The pseudo-class name `CSS.forcePseudoState` understands.
 *
 * Only the standard spelling works. Passing `-webkit-autofill` forces nothing at all — measured on
 * the Chromium that `@playwright/test` 1.62.1 ships (151.0.7922.34), where forcing the legacy name
 * left every probe unset while the standard one lit both spellings. Blink keeps `:autofill` and
 * `:-webkit-autofill` as separate `CSSSelector::PseudoType` values but resolves both against the
 * same forced bit, so forcing the standard name is enough for a stylesheet written in the legacy
 * one — which is what `kbq-form-field` uses throughout.
 *
 * `forcePseudoState` does not validate: an unknown name resolves successfully and silently forces
 * nothing, which is why every helper below verifies the result instead of trusting the call.
 */
const FORCED_AUTOFILL = 'autofill';

/** Set by the probe stylesheet on whatever the browser reports as autofilled. */
const PROBE_PROPERTY = '--kbq-e2e-autofilled';

/**
 * Deliberately not one of the declarations the form field makes. Reading back the component's own
 * `box-shadow` or the container's tint to decide whether forcing worked would make the check pass
 * for the same reason the assertion under it passes, and both would go green on a stylesheet that
 * had stopped matching anything.
 */
const PROBE_STYLESHEET = `:autofill, :-webkit-autofill { ${PROBE_PROPERTY}: 1; }`;

type Forcing = {
    cdp: CDPSession;
    /**
     * `DOM.getDocument` re-issues node ids and orphans the ones handed out before it, while the
     * pseudo-states forced on those ids stay in effect. Calling it once per page and keeping the
     * root is what makes `e2eClearForcedAutofill` able to undo what `e2eForceAutofill` did; calling
     * it per request produces ids that force correctly and cannot be cleared afterwards.
     */
    rootNodeId: number;
    forcedNodeIds: Set<number>;
};

/**
 * One session per page, kept for the page's lifetime.
 *
 * Forced states live with the CSS agent, so detaching the session — or letting it be garbage
 * collected — drops every one of them, silently, turning each later assertion into a test that
 * passes because nothing is being styled. Playwright disposes the session when the page closes.
 */
const forcings = new WeakMap<Page, Promise<Forcing>>();

const openForcing = async (page: Page): Promise<Forcing> => {
    const cdp = await page.context().newCDPSession(page);

    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    await page.addStyleTag({ content: PROBE_STYLESHEET });

    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });

    return { cdp, rootNodeId: root.nodeId, forcedNodeIds: new Set() };
};

const getForcing = (page: Page): Promise<Forcing> => {
    if (!forcings.has(page)) {
        forcings.set(page, openForcing(page));
    }

    return forcings.get(page)!;
};

/** How many elements the browser currently reports as autofilled, according to the probe alone. */
const countProbed = (page: Page, selector: string): Promise<number> =>
    page.evaluate(
        ([sel, property]) =>
            Array.from(document.querySelectorAll(sel)).filter(
                (element) => getComputedStyle(element).getPropertyValue(property).trim() !== ''
            ).length,
        [selector, PROBE_PROPERTY] as const
    );

/**
 * Puts every element matching `selector` into `:-webkit-autofill` for the rest of the test, and
 * returns how many were affected.
 *
 * Real autofill cannot be triggered from a test: choosing a suggestion happens in browser chrome,
 * and the CDP `Autofill` domain that would do it is compiled into Chrome-branded builds only —
 * `Schema.getDomains` on the Chromium Playwright bundles lists 35 domains and `Autofill` is not
 * among them, so `Autofill.enable` fails with "wasn't found". Forcing the pseudo-class is the whole
 * of what is available, and it is enough: Chrome applies its own autofill background to a forced
 * element too, so the design system's suppression of that background is exercised for real.
 *
 * Throws when nothing matched. A run where the forcing quietly reached nothing renders exactly like
 * a correct one, so it would produce a perfectly stable baseline and pass forever.
 */
export const e2eForceAutofill = async (page: Page, selector: string): Promise<number> => {
    const { cdp, rootNodeId, forcedNodeIds } = await getForcing(page);
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: rootNodeId, selector });

    if (!nodeIds.length) {
        throw new Error(`e2eForceAutofill: nothing matches ${selector}`);
    }

    for (const nodeId of nodeIds) {
        // One node at a time: `forcePseudoState` takes a single node, and the forced list replaces
        // whatever that node carried before rather than adding to it.
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [FORCED_AUTOFILL] });
        forcedNodeIds.add(nodeId);
    }

    const probed = await countProbed(page, selector);

    if (probed !== nodeIds.length) {
        throw new Error(
            `e2eForceAutofill: forced ${nodeIds.length} node(s) matching ${selector}, but ${probed} report ` +
                `as autofilled. Forcing an unknown pseudo-class name succeeds and does nothing, so this is ` +
                `what a rename of "${FORCED_AUTOFILL}" in a newer Chromium looks like.`
        );
    }

    return probed;
};

/**
 * Undoes every forcing made on this page, so one test can compare an autofilled control against the
 * same control before the fill.
 *
 * Clearing goes through the node ids the forcing used — see the note on `Forcing.rootNodeId`.
 */
export const e2eClearForcedAutofill = async (page: Page): Promise<void> => {
    const { cdp, forcedNodeIds } = await getForcing(page);

    for (const nodeId of forcedNodeIds) {
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
    }

    forcedNodeIds.clear();
};

/**
 * What `property: value` computes to in `locator`'s own cascade — the way to compare against a
 * design token without hardcoding a colour.
 *
 * Reading the custom property directly does not work: `getPropertyValue('--x')` returns the token's
 * substituted text (`oklch(52.7% 0.2480 258.1 / 0.10)`) while the computed `background-color` it
 * feeds is renormalized (`oklch(0.527 0.248 258.1 / 0.1)`), so the two never compare equal as
 * strings. Letting the browser resolve the same declaration on a throwaway child sidesteps that,
 * and survives a token being re-valued or moved between theme files.
 */
export const e2eResolveCssValue = (locator: Locator, property: string, value: string): Promise<string> =>
    locator.evaluate(
        (element, [prop, val]) => {
            const probe = document.createElement('div');

            probe.style.setProperty(prop, val);
            element.append(probe);

            const resolved = getComputedStyle(probe).getPropertyValue(prop);

            probe.remove();

            return resolved;
        },
        [property, value] as const
    );

/**
 * The animations currently running on `locator`, as `[property, duration]` pairs.
 *
 * The form field hides Chrome's autofill background by parking a `background-color` transition at
 * an absurd duration, because a running transition is the one thing in the cascade that outranks
 * the UA's `!important`. `animations: 'disabled'` — the project default for screenshots — calls
 * `finish()` on every animation with a finite end time, and 5000s is finite: the suppression is
 * fast-forwarded to its end value and the control paints Chrome's opaque blue instead. That is not
 * recoverable within the page. Once finished the transition is gone, and a later capture with
 * `animations: 'allow'` still sees the blue, so this has to be checked *before* a screenshot rather
 * than after one.
 */
export const e2eRunningAnimations = (locator: Locator): Promise<[string, number | string][]> =>
    locator.evaluate(
        (element) =>
            element.getAnimations().map((animation) => [
                (animation as CSSTransition).transitionProperty ?? animation.constructor.name,
                animation.effect?.getComputedTiming().duration ?? 'unknown'
            ]) as [string, number | string][]
    );
