import { expect, Locator, Page, test } from '@playwright/test';
import {
    e2eClearForcedAutofill,
    e2eEnableDarkTheme,
    e2eForceAutofill,
    e2eResolveCssValue,
    e2eRunningAnimations
} from '../../e2e/utils';

test.describe('KbqFormFieldModule', () => {
    test.describe('E2eFormFieldAddons', () => {
        test.beforeEach(async ({ page }) => page.goto('/E2eFormFieldAddons'));

        test('cleaner owns pointer and keyboard clearing', async ({ page }) => {
            const input = page.getByTestId('cleanerInput');

            await input.focus();
            await input.press('Escape');
            await expect(input).toHaveValue('');

            await input.fill('Koobiq');
            await page.getByTestId('cleaner').focus();
            await page.getByTestId('cleaner').press('Space');
            await expect(input).toHaveValue('');
            await expect(input).toBeFocused();
        });

        test('password toggle owns Alt+F8', async ({ page }) => {
            const input = page.getByTestId('passwordInput');

            await expect(input).toHaveAttribute('type', 'password');
            await input.press('Alt+F8');
            await expect(input).toHaveAttribute('type', 'text');
        });

        test('stepper connects when projected dynamically', async ({ page }) => {
            const input = page.getByTestId('numberInput');

            await page.getByTestId('showStepper').click();
            await page.getByTestId('stepper').locator('.kbq-stepper-step-up').click();
            await expect(input).toHaveValue('11');
        });
    });

    test.describe('E2eFormFieldGroup', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldGroup');

        test('horizontal', async ({ page }) => {
            const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eHorizontalTarget');

            await page.goto('/E2eFormFieldGroup');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
        });

        test('vertical', async ({ page }) => {
            const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eVerticalTarget');

            await page.goto('/E2eFormFieldGroup');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eFormFieldset', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldset');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('horizontal', async ({ page }) => {
            await page.goto('/E2eFormFieldset');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-light.png');
        });

        // All height tokens involved are whole CSS pixels, so at a 1x device pixel ratio the
        // form-field's height (sum of independently-rounded border/padding/line-height values) and
        // the button's height (a single token) land on the same integer and a plain boundingBox
        // comparison would pass either way. Fractional device pixel ratios force the browser to snap
        // each side's boxes to physical pixels independently, which is what actually exposes a
        // regression of the merged-border seam.
        for (const deviceScaleFactor of [1.5, 2.5]) {
            test.describe(`at ${deviceScaleFactor}x device scale`, () => {
                test.use({ deviceScaleFactor });

                test('button and form-field stay flush at the shared border seam', async ({ page }) => {
                    await page.goto('/E2eFormFieldset');
                    const locator = getComponent(page);

                    const fieldBox = (await locator.locator('.kbq-form-field__container').boundingBox())!;
                    const buttonBox = (await locator.locator('button.kbq-button').boundingBox())!;

                    expect(fieldBox.height).toBeCloseTo(buttonBox.height, 1);
                    expect(fieldBox.y).toBeCloseTo(buttonBox.y, 1);
                    expect(fieldBox.y + fieldBox.height).toBeCloseTo(buttonBox.y + buttonBox.height, 1);
                });
            });
        }
    });

    /**
     * Browser autofill (#DS-4096).
     *
     * Autofill in `kbq-form-field` is entirely CSS — three rule blocks and four tokens, no
     * TypeScript anywhere — and jsdom implements neither `:-webkit-autofill` nor CSS animations, so
     * none of it can be reached from a unit test. It has also regressed five times (DS-2873,
     * DS-4060, DS-4667, DS-4950, DS-4958) with no automated coverage at all.
     *
     * `:-webkit-autofill` cannot be produced synthetically — choosing a suggestion happens in
     * browser chrome, and the CDP `Autofill` domain is Chrome-branded only — so these tests force
     * the pseudo-class over CDP. Chrome applies its own autofill background to a forced element
     * too, so the design system's suppression of that background is genuinely exercised.
     *
     * Several assertions below pin behaviour that is wrong. They are marked, and they say what the
     * value should become; DS-4096 is the ticket that will change them.
     */
    test.describe('E2eFormFieldAutofill', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eFormFieldAutofill');
        const getField = (page: Page, cell: string) => page.getByTestId(cell);
        const getContainer = (field: Locator) => field.locator('.kbq-form-field__container');
        const getControl = (field: Locator) => field.locator('.kbq-input, .kbq-tag-input, .kbq-textarea');

        /** Every state the state matrix renders a plain input in, in the order it renders them. */
        const STATES = [
            'default',
            'focused',
            'kbqFocused',
            'error',
            'errorFocused',
            'disabled',
            'noBorders',
            'inOverlay'
        ] as const;

        /** Every control the control matrix renders, in the order it renders them. */
        const CONTROLS = [
            'input',
            'password',
            'number',
            'timepicker',
            'tagInput',
            'tagInputBare',
            'textarea',
            'select'
        ] as const;

        /** `rgb(…)` carries no alpha and is opaque; `rgba(…)` puts it fourth. */
        const alphaOf = (color: string): number => {
            const parts = color.match(/rgba?\(([^)]+)\)/)?.[1].split(',') ?? [];

            return parts.length === 4 ? Number(parts[3]) : 1;
        };

        const resolveToken = (field: Locator, token: string): Promise<string> =>
            e2eResolveCssValue(field, 'background-color', `var(${token})`);

        /**
         * Forces autofill on one cell's control and hands back the pieces every test needs.
         *
         * Scoped to the cell rather than the page: the matrix renders the same control in eight
         * states, and forcing all of them would make every assertion below depend on cells it is
         * not about.
         */
        const autofill = async (page: Page, cell: string) => {
            const field = getField(page, cell);
            const forced = await e2eForceAutofill(page, `[data-testid="${cell}"] :is(.kbq-input, .kbq-tag-input)`);

            return { field, container: getContainer(field), control: getControl(field), forced };
        };

        test.beforeEach(async ({ page }) => page.goto('/E2eFormFieldAutofill'));

        test('the matrix renders every cell the tests address', async ({ page }) => {
            // The route is the class name with Angular's leading underscore stripped, so a rename
            // yields a blank page — and a blank page is a perfectly stable, perfectly meaningless
            // baseline. Assert the fixture exists before anything trusts it.
            await expect(getComponent(page)).toBeVisible();

            for (const state of STATES) {
                await expect(getField(page, `state_${state}`)).toBeVisible();
            }

            for (const control of CONTROLS) {
                await expect(getField(page, `control_${control}_default`)).toBeVisible();
                await expect(getField(page, `control_${control}_focused`)).toBeVisible();
            }
        });

        test.describe('container background', () => {
            for (const state of STATES) {
                test(`is the autofill tint in the ${state} state`, async ({ page }) => {
                    const { field, container } = await autofill(page, `state_${state}`);

                    await expect(container).toHaveCSS(
                        'background-color',
                        await resolveToken(field, '--kbq-form-field-states-autofill-background')
                    );
                });
            }

            // The four below are the ticket. `_form-field-theme.scss:111-116` paints the container
            // with `!important`, and an important author declaration out-ranks every normal one the
            // state themes make — regardless of the source order that would otherwise decide it.
            // The tint is translucent (10% in the light theme, 21% in the dark), so it composites
            // over the state's own background rather than replacing it; the state is still lost.
            //
            // `disabled` is worth a word, because the obvious objection is that a disabled control
            // cannot be autofilled — and it cannot: Chrome skips disabled fields when it fills. The
            // combination is reached from the other side, by filling first and disabling after,
            // which is what conditional forms do all the time ("same as billing address", "use the
            // saved card"). The pseudo-class is cleared when the value changes, not when the
            // control is disabled, so it survives. Reasoned rather than measured: real autofill
            // cannot be driven here at all, and forcing says nothing about persistence.
            //
            // It is also the worst of the four. The tint eats the disabled background and
            // `-webkit-text-fill-color` eats the grey disabled text, so an autofilled disabled
            // field reads as an editable one — a lost affordance, not a cosmetic slip.
            for (const [state, token] of [
                ['error', '--kbq-form-field-states-error-background'],
                ['disabled', '--kbq-form-field-states-disabled-background'],
                ['focused', '--kbq-form-field-states-focused-background']
            ] as const) {
                test(`DS-4096: autofill out-ranks the ${state} background`, async ({ page }) => {
                    const { field, container } = await autofill(page, `state_${state}`);

                    // Should become: the container keeps the state's own background, because
                    // autofill is the weakest state there is.
                    await expect(container).not.toHaveCSS('background-color', await resolveToken(field, token));
                });
            }

            test('DS-4096: autofill out-ranks the in-overlay background', async ({ page }) => {
                const { field, container } = await autofill(page, 'state_inOverlay');

                // `form-field.scss:153-158` remaps four backgrounds for `_in-overlay` and not this
                // one, so a field in an overlay loses its card background the moment it is filled.
                await expect(container).not.toHaveCSS(
                    'background-color',
                    await resolveToken(field, '--kbq-background-card')
                );
            });

            test('DS-4096: the autofill border-color token is declared and never read', async ({ page }) => {
                const { field, container } = await autofill(page, 'state_default');

                // `_kbq-form-field-state()` is never invoked with `states-autofill`, so the mixin
                // that would consume `-border-color` and `-placeholder` never runs for it. The
                // container keeps the default border while the token sits there looking applied.
                await expect(container).toHaveCSS(
                    'border-top-color',
                    await resolveToken(field, '--kbq-form-field-default-border-color')
                );
                await expect(container).not.toHaveCSS(
                    'border-top-color',
                    await resolveToken(field, '--kbq-form-field-states-autofill-border-color')
                );
            });

            test('the local token wins over the one the npm package publishes', async ({ page }) => {
                // `@koobiq/design-tokens` declares the same four names globally on `.kbq-light`
                // with different values. Both declarations are (0,1,0); the local one wins only
                // because it sits on the form field itself while the package's is inherited from
                // `body`. Nothing enforces that, so it is worth an assertion.
                const field = getField(page, 'state_default');
                const onField = await resolveToken(field, '--kbq-form-field-states-autofill-background');
                const onBody = await resolveToken(page.locator('body'), '--kbq-form-field-states-autofill-background');

                expect(onField).not.toBe(onBody);
            });
        });

        test.describe('control fill suppression', () => {
            test('the control stays transparent so the container tint shows through', async ({ page }) => {
                const { control } = await autofill(page, 'state_default');

                // Chrome paints its own background on an autofilled control with a UA `!important`
                // rule that an author declaration cannot out-rank. What does out-rank it is a
                // running transition, which is why the stylesheet parks `background-color` on a
                // 5000s one. The used value is Chrome's `rgb(232, 240, 254)` held at alpha 0 — so
                // assert the alpha, not the colour: immediately after forcing it still reads
                // `rgba(0, 0, 0, 0)` and only settles on the blue a frame later.
                expect(alphaOf(await control.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(0);
            });

            test('the suppression is a running transition, not a finished one', async ({ page }) => {
                const { control } = await autofill(page, 'state_default');

                expect(await e2eRunningAnimations(control)).toEqual([['background-color', 5_000_000]]);
            });

            test('the text and caret are repainted through -webkit-text-fill-color', async ({ page }) => {
                const { field, control } = await autofill(page, 'state_default');
                const expected = await resolveToken(field, '--kbq-form-field-states-autofill-text');

                // `color` is forced by the UA on an autofilled control, so the stylesheet repaints
                // through `-webkit-text-fill-color`, which wins over `color` when glyphs are drawn.
                await expect(control).toHaveCSS('-webkit-text-fill-color', expected);
                // No baseline can show this one: `toHaveScreenshot` defaults to `caret: 'hide'`,
                // which sets `caret-color: transparent !important` inline for the capture.
                await expect(control).toHaveCSS('caret-color', expected);
            });

            test('DS-4096: the inset box-shadow paints nothing', async ({ page }) => {
                const { control } = await autofill(page, 'state_default');

                // `_form-field-theme.scss:52` re-declares the token as transparent *on the control*
                // and line 53 then spreads that transparent colour over 40rem. The declaration is
                // dead: the whole of the suppression is the transition above. Should become: the
                // line is deleted.
                await expect(control).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0) 0px 0px 0px 640px inset');
            });

            test('DS-4096: the same token reads differently on the control and the container', async ({ page }) => {
                const { field, container, control } = await autofill(page, 'state_default');

                // The local re-declaration shadows the token for the control's subtree only, so
                // `--kbq-form-field-states-autofill-background` means two different things a single
                // element apart. Reading it off the wrong node is a silent way to write a test that
                // proves nothing.
                expect(alphaOf(await control.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(0);
                await expect(container).toHaveCSS(
                    'background-color',
                    await resolveToken(field, '--kbq-form-field-states-autofill-background')
                );
            });

            for (const [state, token] of [
                ['error', '--kbq-form-field-states-error-text'],
                ['disabled', '--kbq-form-field-states-disabled-text']
            ] as const) {
                test(`DS-4096: the ${state} text colour is lost when the field is autofilled`, async ({ page }) => {
                    const { field, control } = await autofill(page, `state_${state}`);

                    // `-webkit-text-fill-color` is a flat `--kbq-foreground-contrast` with no idea
                    // which state the field is in. Should become: the repaint reads back whatever
                    // the state cascade resolved.
                    await expect(control).not.toHaveCSS('-webkit-text-fill-color', await resolveToken(field, token));
                });
            }
        });

        test.describe('focus geometry', () => {
            // `--kbq-size-3xl` is 32px, `--kbq-size-xs` 6px, the border 1px and the focus outline
            // 1px, so `form-field.scss:123-134` shrinks the control from 30px to 28px and moves the
            // 2px it took back out into the margin.
            test('an autofilled input shrinks to clear the focus ring', async ({ page }) => {
                const { control } = await autofill(page, 'state_focused');

                await expect(control).toHaveCSS('min-height', '28px');
                await expect(control).toHaveCSS('margin-top', '1px');
                await expect(control).toHaveCSS('padding-top', '4px');
            });

            test('the same input keeps its full height when it is not focused', async ({ page }) => {
                const { control } = await autofill(page, 'state_default');

                await expect(control).toHaveCSS('min-height', '30px');
                await expect(control).toHaveCSS('margin-top', '0px');
                await expect(control).toHaveCSS('padding-top', '5px');
            });

            test('the kbq-focused branch of the selector behaves identically', async ({ page }) => {
                const { control } = await autofill(page, 'state_kbqFocused');

                await expect(control).toHaveCSS('min-height', '28px');
                await expect(control).toHaveCSS('margin-top', '1px');
            });

            test('the 2px the control gives up is returned as margin', async ({ page }) => {
                const focused = await autofill(page, 'state_focused');
                const plain = await autofill(page, 'state_default');

                // The control shrinks by exactly the focus outline on both edges...
                expect((await focused.control.boundingBox())!.height).toBeCloseTo(
                    (await plain.control.boundingBox())!.height - 2,
                    1
                );
                // ...and `margin: 1px 0` hands those 2px straight back, so the field around it does
                // not move. That is the whole point of the block: make room for the ring the
                // container draws as an inset shadow without the field changing size on focus.
                expect((await focused.container.boundingBox())!.height).toBeCloseTo(
                    (await plain.container.boundingBox())!.height,
                    1
                );
            });

            test('DS-4096: no tag input gets the geometry, canonical or bare', async ({ page }) => {
                const canonical = await autofill(page, 'control_tagInput_focused');
                const bare = await autofill(page, 'control_tagInputBare_focused');

                // Two different reasons, same outcome, and neither is intended. The canonical
                // markup does carry `.kbq-input`, so `form-field.scss:123` matches it — but
                // `tag-list.scss:37` declares `min-height: unset !important` on
                // `.kbq-tag-input.kbq-input`, and an important declaration out-ranks the plain one
                // in the autofill block. The bare input never had `.kbq-input` to begin with, which
                // is what DS-4958 missed when it widened the two theme blocks and left this one on
                // `.kbq-input` alone.
                //
                // Should become: the autofill geometry covers tag inputs, which means
                // `form-field.scss:119` widening *and* something giving on the `!important`.
                await expect(canonical.control).toHaveCSS('min-height', 'auto');
                await expect(bare.control).toHaveCSS('min-height', 'auto');
            });
        });

        test.describe('controls the stylesheet does not reach', () => {
            test('DS-4096: an autofilled textarea shows Chromes own background', async ({ page }) => {
                const field = getField(page, 'control_textarea_default');
                const control = getControl(field);

                await e2eForceAutofill(page, '[data-testid="control_textarea_default"] .kbq-textarea');

                // `.kbq-textarea` appears in `_kbq-form-field-state()`'s colour list but in none of
                // the three autofill blocks, so nothing suppresses the UA background and nothing
                // tints the container. The result is not "no highlight" but Chrome's raw opaque
                // blue inside an otherwise untouched field.
                expect(alphaOf(await control.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(1);
                await expect(control).toHaveCSS('box-shadow', 'none');
                expect(await e2eRunningAnimations(control)).toEqual([]);
                await expect(getContainer(field)).not.toHaveCSS(
                    'background-color',
                    await resolveToken(field, '--kbq-form-field-states-autofill-background')
                );
            });

            test('a select has no native control to autofill', async ({ page }) => {
                // The trigger is a div, so `:-webkit-autofill` can never match inside it. Asserted
                // rather than assumed, because a future select that renders an input would silently
                // join the set of things this suite does not cover.
                await expect(getField(page, 'control_select_default').locator('input')).toHaveCount(0);
            });

            test('every text control the rules do reach carries .kbq-input', async ({ page }) => {
                // The three blocks key on classes, not on directives, so this is what decides
                // whether a control is covered. Datepicker is checked here rather than rendered in
                // the matrix: a KbqDatepicker throws when a second input binds to it.
                for (const control of ['input', 'password', 'number', 'timepicker'] as const) {
                    await expect(getField(page, `control_${control}_default`).locator('.kbq-input')).toHaveCount(1);
                }

                await expect(
                    getField(page, 'control_tagInput_default').locator('.kbq-input.kbq-tag-input')
                ).toHaveCount(1);
                await expect(getField(page, 'control_tagInputBare_default').locator('.kbq-input')).toHaveCount(0);
                await expect(getField(page, 'control_textarea_default').locator('.kbq-input')).toHaveCount(0);
            });
        });

        test.describe('selector variants', () => {
            test('the :hover variant carries no declarations of its own', async ({ page }) => {
                // Named properties rather than `cssText`: on a computed style that is always the
                // empty string, so comparing it would pass whatever hovering did.
                const paint = (locator: Locator) =>
                    locator.evaluate((el) => {
                        const style = getComputedStyle(el);

                        return [style.backgroundColor, style.boxShadow, style.webkitTextFillColor].join(' | ');
                    });

                const { field, container, control } = await autofill(page, 'state_default');
                const before = { control: await paint(control), container: await paint(container) };

                await control.hover();

                // `:-webkit-autofill:hover` repeats the base block's declarations verbatim; it
                // exists to out-rank UA rules, not to change anything.
                expect(await paint(control)).toBe(before.control);
                expect(await paint(container)).toBe(before.container);
                await expect(container).toHaveCSS(
                    'background-color',
                    await resolveToken(field, '--kbq-form-field-states-autofill-background')
                );
            });

            test('clearing the forced state puts the field back', async ({ page }) => {
                const { field, container } = await autofill(page, 'state_default');
                const tint = await resolveToken(field, '--kbq-form-field-states-autofill-background');

                await expect(container).toHaveCSS('background-color', tint);

                await e2eClearForcedAutofill(page);

                // Guards the helper itself: a forced state is keyed to the node id it was set on,
                // and `DOM.getDocument` re-issues ids, so a clear that addresses a fresh id looks
                // like it worked and changes nothing.
                await expect(container).not.toHaveCSS('background-color', tint);
                await expect(container).toHaveCSS(
                    'background-color',
                    await resolveToken(field, '--kbq-form-field-default-background')
                );
            });
        });

        /**
         * The rules themselves, read out of the CSSOM.
         *
         * These need no pseudo-class to match, so they keep working if a future Chromium drops the
         * forcing this suite depends on — and they pin things a rendered assertion cannot see at
         * all: which selectors exist, which declarations are `!important`, and where each block
         * sits relative to the state blocks it competes with.
         */
        test.describe('the rules themselves', () => {
            type Rule = { index: number; selector: string; text: string };

            /** Every style rule in document order, flattened across all stylesheets. */
            const readRules = (page: Page): Promise<Rule[]> =>
                page.evaluate(() => {
                    const rules: { index: number; selector: string; text: string }[] = [];
                    const sheets = [...Array.from(document.styleSheets), ...document.adoptedStyleSheets];

                    for (const sheet of sheets) {
                        // A cross-origin stylesheet throws on access; none is expected here, but one
                        // would otherwise take the whole group down with a security error.
                        let cssRules: CSSRuleList;

                        try {
                            cssRules = sheet.cssRules;
                        } catch {
                            continue;
                        }

                        for (const rule of Array.from(cssRules)) {
                            if (rule instanceof CSSStyleRule) {
                                rules.push({ index: rules.length, selector: rule.selectorText, text: rule.cssText });
                            }
                        }
                    }

                    return rules;
                });

            const findRule = (rules: Rule[], match: (selector: string) => boolean): Rule | undefined =>
                rules.find((rule) => match(rule.selector));

            test('the suppression block covers .kbq-input and .kbq-tag-input in all three variants', async ({
                page
            }) => {
                const rules = await readRules(page);
                // Keyed on the tag-input arm on purpose: the focus-geometry block below also
                // matches `.kbq-input:-webkit-autofill` and comes first in document order, so a
                // looser predicate silently finds that one instead.
                const block = findRule(rules, (selector) => selector.includes('.kbq-tag-input:-webkit-autofill'));

                expect(block).toBeDefined();
                expect(block!.selector).toContain('.kbq-input:-webkit-autofill');
                expect(block!.selector).toContain(':-webkit-autofill:hover');
                expect(block!.selector).toContain(':-webkit-autofill:focus');
                expect(block!.text).toContain('-webkit-text-fill-color');
                // DS-4096: `.kbq-textarea` belongs in this list and is not in it, which is why an
                // autofilled textarea paints Chrome's own background.
                expect(block!.selector).not.toContain('.kbq-textarea');
            });

            test('the focus-geometry block is a separate rule covering .kbq-input alone', async ({ page }) => {
                const rules = await readRules(page);
                const block = findRule(rules, (selector) =>
                    selector.includes('.cdk-focused .kbq-input:-webkit-autofill')
                );

                expect(block).toBeDefined();
                expect(block!.selector).toContain('.kbq-focused .kbq-input:-webkit-autofill');
                expect(block!.text).toContain('min-height');
                // DS-4958 widened the two theme blocks and left this one behind.
                expect(block!.selector).not.toContain('.kbq-tag-input');
                expect(block!.selector).not.toContain('.kbq-textarea');
            });

            test('DS-4096: the container block paints with !important', async ({ page }) => {
                const rules = await readRules(page);
                const block = findRule(
                    rules,
                    (selector) => selector.includes(':has(') && selector.includes('autofill')
                );

                expect(block).toBeDefined();
                // The `!important` is the ticket in one token: it is what lets autofill out-rank
                // error, disabled and focused, none of which use it.
                expect(block!.text).toContain('!important');
            });

            test('DS-4096: no rule remaps the autofill background for no-borders or in-overlay', async ({ page }) => {
                const rules = await readRules(page);
                const remaps = rules.filter(
                    (rule) =>
                        /_no-borders|_without-borders|_in-overlay/.test(rule.selector) &&
                        rule.text.includes('--kbq-form-field-states-autofill-background')
                );

                // `form-field.scss:143-158` remaps the other four backgrounds for both modifiers and
                // skips this one, which is why an autofilled field in an overlay loses its card
                // background. Pinned structurally so it survives the forcing being unavailable.
                expect(remaps).toEqual([]);
            });

            test('DS-4096: the two dead autofill tokens are declared and never read', async ({ page }) => {
                const rules = await readRules(page);
                const readsToken = (token: string) => rules.filter((rule) => rule.text.includes(`var(${token})`));

                expect(readsToken('--kbq-form-field-states-autofill-border-color')).toEqual([]);
                expect(readsToken('--kbq-form-field-states-autofill-placeholder')).toEqual([]);
                // Both are declared, so this is dead weight rather than a missing token.
                expect(
                    rules.filter((rule) => rule.text.includes('--kbq-form-field-states-autofill-border-color:')).length
                ).toBeGreaterThan(0);
            });

            test('the stylesheet uses only the legacy spelling of the pseudo-class', async ({ page }) => {
                const rules = await readRules(page);
                const standardSpelling = rules.filter(
                    (rule) => /(^|[^-]):autofill\b/.test(rule.selector) && rule.selector.includes('kbq-')
                );

                // A fix that adds `:is(:autofill, :-webkit-autofill)` has to update this test — which
                // is the point of having it, since the two spellings are not interchangeable for
                // `CSS.forcePseudoState` and the helper forces the standard one.
                expect(standardSpelling).toEqual([]);
            });

            test('nothing drives autofill from TypeScript', async ({ page }) => {
                // No `AutofillMonitor`, no `kbq-form-field_autofilled`. If a fix introduces one, the
                // suite above keeps passing while testing only half the mechanism, so pin it here.
                await e2eForceAutofill(page, '[data-testid="state_default"] .kbq-input');

                expect(await page.locator('[class*="autofill"]').count()).toBe(0);
            });
        });

        /**
         * What computed style cannot show: how a 10%-alpha tint composites over each state's own
         * background, and the 1px seam the focus geometry leaves behind.
         *
         * Nested in its own describe so a local run can exclude it with `--grep-invert screenshots`
         * — baselines are Linux bytes compared at `threshold: 0` and only reproduce under Docker.
         */
        test.describe('screenshots', () => {
            /**
             * The project default is `animations: 'disabled'`, which calls `finish()` on every
             * animation with a finite end time — and the 5000s `background-color` transition that
             * hides Chrome's autofill background is finite. Fast-forwarding it makes every control
             * paint Chrome's opaque blue instead of the design system's tint, and it does not come
             * back: once finished the transition is gone, so a later capture with 'allow' still
             * shows the blue. Measured, not guessed. Do not remove.
             */
            const screenshot = { animations: 'allow' } as const;

            /**
             * Fails loudly if the suppression has already been fast-forwarded.
             *
             * Takes the cell to probe rather than assuming one: each shot forces only its own
             * matrix, so a fixed probe in the other one reads "no transition" and would report the
             * suppression as broken when it is merely untouched.
             */
            const expectStillSuppressed = async (page: Page, cell: string) => {
                const control = getField(page, cell).locator('.kbq-input');

                expect(await e2eRunningAnimations(control)).toEqual([['background-color', 5_000_000]]);
            };

            /**
             * How many rendered boxes stick out of the screenshot target.
             *
             * A locator screenshot of something wider than the viewport is cropped without failing,
             * and a cropped baseline is stable, reviewable and wrong — it silently stops covering
             * whatever fell off the edge. Counting the overflow is the only thing that catches it.
             */
            const countOutside = (target: Locator): Promise<number> =>
                target.evaluate((root: HTMLElement) => {
                    const box = root.getBoundingClientRect();

                    return Array.from(root.querySelectorAll('*'))
                        .map((element) => element.getBoundingClientRect())
                        .filter(({ width, height }) => width > 0 && height > 0)
                        .filter(
                            ({ left, top, right, bottom }) =>
                                left < box.left - 0.5 ||
                                top < box.top - 0.5 ||
                                right > box.right + 0.5 ||
                                bottom > box.bottom + 0.5
                        ).length;
                });

            for (const [name, target, probeCell] of [
                ['04', 'e2eStateMatrix', 'state_default'],
                ['05', 'e2eControlMatrix', 'control_input_default']
            ] as const) {
                test(`${target} under forced autofill`, async ({ page }) => {
                    const matrix = page.getByTestId(target);

                    // Every control in the matrix, so the shot shows the whole cross-section rather
                    // than one forced cell among unforced ones.
                    const forced = await e2eForceAutofill(
                        page,
                        `[data-testid="${target}"] :is(.kbq-input, .kbq-tag-input, .kbq-textarea)`
                    );

                    // An absolute count, not a re-query of the same selector: that would only ever
                    // catch zero, and the number that matters is "one column silently missing".
                    expect(forced).toBe(target === 'e2eStateMatrix' ? STATES.length : (CONTROLS.length - 1) * 2);

                    // Forcing reaches elements that are scrolled out of the shot, so the count above
                    // says nothing about whether they are in it.
                    expect(await countOutside(matrix)).toBe(0);
                    expect((await matrix.boundingBox())!.width).toBeLessThanOrEqual(1200);

                    await expectStillSuppressed(page, probeCell);
                    await expect(matrix).toHaveScreenshot(`${name}-light.png`, screenshot);

                    await e2eEnableDarkTheme(page);
                    await expect(matrix).toHaveScreenshot(`${name}-dark.png`, screenshot);
                });
            }
        });
    });
});
