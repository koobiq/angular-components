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
         * The tint as the browser renders it.
         *
         * It is painted into `background-image` rather than `background-color` so that the state
         * keeps ownership of the latter — which is what makes autofill impossible to put in
         * conflict with error, disabled or the overlay.
         */
        const tintLayer = async (field: Locator): Promise<string> => {
            const tint = await resolveToken(field, '--kbq-form-field-states-autofill-background');

            return `linear-gradient(${tint}, ${tint})`;
        };

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
                test(`is tinted in the ${state} state`, async ({ page }) => {
                    const { field, container } = await autofill(page, `state_${state}`);

                    await expect(container).toHaveCSS('background-image', await tintLayer(field));
                });
            }

            // The tint is a layer, so every state keeps the background it resolved and the tint
            // composites over it. That is the whole of the DS-4096 fix: painting into
            // `background-image` leaves `background-color` to the state, which makes the two
            // impossible to put in conflict — where the old rule needed `!important` to land, and
            // then out-ranked error, disabled and the overlay with it.
            for (const [state, token] of [
                ['default', '--kbq-form-field-default-background'],
                ['focused', '--kbq-form-field-states-focused-background'],
                ['error', '--kbq-form-field-states-error-background'],
                ['errorFocused', '--kbq-form-field-states-error-background'],
                ['disabled', '--kbq-form-field-states-disabled-background']
            ] as const) {
                test(`keeps the ${state} background under the tint`, async ({ page }) => {
                    const { field, container } = await autofill(page, `state_${state}`);

                    await expect(container).toHaveCSS('background-color', await resolveToken(field, token));
                });
            }

            test('keeps the card background in an overlay', async ({ page }) => {
                const { field, container } = await autofill(page, 'state_inOverlay');

                // `form-field.scss` remaps the state backgrounds to the card colour for
                // `_in-overlay` and never had to know autofill exists.
                await expect(container).toHaveCSS(
                    'background-color',
                    await resolveToken(field, '--kbq-background-card')
                );
                await expect(container).toHaveCSS('background-image', await tintLayer(field));
            });

            test('no autofill rule declares !important', async ({ page }) => {
                // The `!important` at the heart of DS-4060 is what made autofill out-rank every
                // state. Nothing about the layer approach needs it back.
                await autofill(page, 'state_error');

                const important = await page.evaluate(() =>
                    Array.from(document.styleSheets)
                        .flatMap((sheet) => {
                            try {
                                return Array.from(sheet.cssRules);
                            } catch {
                                return [];
                            }
                        })
                        .filter(
                            (rule): rule is CSSStyleRule =>
                                rule instanceof CSSStyleRule && rule.selectorText.includes('autofill')
                        )
                        .filter((rule) => rule.cssText.includes('!important'))
                        .map((rule) => rule.selectorText)
                );

                expect(important).toEqual([]);
            });

            test('leaves the border to the state', async ({ page }) => {
                // Autofill contributes no border of its own — the token that would have given it
                // one aliased the focus colour, which made a merely filled field read as focused.
                const plain = await autofill(page, 'state_default');
                const invalid = await autofill(page, 'state_error');

                await expect(plain.container).toHaveCSS(
                    'border-top-color',
                    await resolveToken(plain.field, '--kbq-form-field-default-border-color')
                );
                await expect(invalid.container).toHaveCSS(
                    'border-top-color',
                    await resolveToken(invalid.field, '--kbq-form-field-states-error-border-color')
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
                // 600000s one. The used value is Chrome's `rgb(232, 240, 254)` held at alpha 0 — so
                // assert the alpha, not the colour: immediately after forcing it still reads
                // `rgba(0, 0, 0, 0)` and only settles on the blue a frame later.
                expect(alphaOf(await control.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(0);
            });

            test('the suppression is a running transition, not a finished one', async ({ page }) => {
                const { control } = await autofill(page, 'state_default');

                expect(await e2eRunningAnimations(control)).toEqual([['background-color', 600_000_000]]);
            });

            for (const [state, token] of [
                ['default', '--kbq-form-field-default-text'],
                ['error', '--kbq-form-field-states-error-text'],
                ['disabled', '--kbq-form-field-states-disabled-text']
            ] as const) {
                test(`repaints the text in the ${state} colour`, async ({ page }) => {
                    const { field, control } = await autofill(page, `state_${state}`);
                    const expected = await resolveToken(field, token);

                    // The UA forces `color` on an autofilled control, so the state repaints through
                    // `-webkit-text-fill-color`, which wins over `color` when glyphs are drawn. The
                    // rule is emitted once per state inside `_kbq-form-field-state()`, so the
                    // ordinary cascade picks the right one and an autofilled invalid field still
                    // prints its error colour.
                    await expect(control).toHaveCSS('-webkit-text-fill-color', expected);
                    // No baseline can show the caret: `toHaveScreenshot` defaults to `caret: 'hide'`
                    // and sets `caret-color: transparent !important` inline for the capture.
                    await expect(control).toHaveCSS('caret-color', expected);
                });
            }

            for (const [theme, scheme, uaColor] of [
                ['light', 'light', 'rgb(0, 0, 0)'],
                ['dark', 'dark', 'rgb(255, 255, 255)']
            ] as const) {
                test(`tells the browser the palette is ${theme}`, async ({ page }) => {
                    if (theme === 'dark') await e2eEnableDarkTheme(page);

                    const { control } = await autofill(page, 'state_default');

                    // The theme is a class, and a class tells the browser nothing. Without
                    // `color-scheme` Chrome renders every surface it paints itself from the light
                    // palette, which is how a dark-themed field ends up with a light autofill
                    // highlight and black text the moment the autofill popup reopens.
                    //
                    // `color` is the readout: the UA forces it on an autofilled control, and which
                    // colour it forces comes from the used `color-scheme`. It is the one thing here
                    // that reflects the palette Chrome would paint with, since that paint never
                    // goes through the cascade and nothing else in the CSSOM shows it.
                    await expect(control).toHaveCSS('color-scheme', scheme);
                    await expect(control).toHaveCSS('color', uaColor);
                });
            }

            test('paints nothing of its own on the control', async ({ page }) => {
                const { control } = await autofill(page, 'state_default');

                // The control contributes no background and no inset shadow — the tint belongs to
                // the container. A second, translucent coat here would make the control's rectangle
                // visibly darker than the container's padding around it.
                await expect(control).toHaveCSS('box-shadow', 'none');
                expect(alphaOf(await control.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(0);
            });
        });

        test.describe('focus ring', () => {
            test('survives an autofilled control', async ({ page }) => {
                const { container, control } = await autofill(page, 'state_focused');

                // DS-4950 shrank the autofilled control by twice the outline width because its
                // background painted over the ring. Nothing paints over it now: the control is
                // transparent and the ring is an inset shadow on the container, drawn above the
                // tint. The geometry compensation is gone, and this is what replaces it.
                expect(await container.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
                expect(alphaOf(await control.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(0);
            });

            test('the control keeps one height focused or not', async ({ page }) => {
                const focused = await autofill(page, 'state_focused');
                const plain = await autofill(page, 'state_default');

                // With the compensation deleted there is nothing left to compensate for, so the
                // control no longer resizes on focus and the text no longer has to be nudged back.
                for (const { control } of [focused, plain]) {
                    await expect(control).toHaveCSS('min-height', '30px');
                    await expect(control).toHaveCSS('margin-top', '0px');
                    await expect(control).toHaveCSS('padding-top', '5px');
                }

                expect((await focused.container.boundingBox())!.height).toBeCloseTo(
                    (await plain.container.boundingBox())!.height,
                    1
                );
            });
        });

        test.describe('controls the stylesheet reaches', () => {
            test('a textarea is treated like every other control', async ({ page }) => {
                const field = getField(page, 'control_textarea_default');
                const control = getControl(field);

                await e2eForceAutofill(page, '[data-testid="control_textarea_default"] .kbq-textarea');

                // `.kbq-textarea` was in `_kbq-form-field-state()`'s colour list and in none of the
                // autofill rules, so nothing suppressed the UA background: an autofilled textarea
                // painted Chrome's raw opaque blue, which in the dark theme was a near-white block
                // with dark text. It is now suppressed the same way as the others.
                expect(alphaOf(await control.evaluate((el) => getComputedStyle(el).backgroundColor))).toBe(0);
                expect(await e2eRunningAnimations(control)).toEqual([['background-color', 600_000_000]]);
                await expect(getContainer(field)).toHaveCSS('background-image', await tintLayer(field));
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

                        return [
                            style.backgroundColor,
                            style.backgroundImage,
                            style.boxShadow,
                            style.webkitTextFillColor
                        ].join(' | ');
                    });

                const { field, container, control } = await autofill(page, 'state_default');
                const before = { control: await paint(control), container: await paint(container) };

                await control.hover();

                // Nothing in the autofill rules keys on `:hover`; the state does, and the state is
                // what owns every channel except the tint.
                expect(await paint(control)).toBe(before.control);
                expect(await paint(container)).toBe(before.container);
                await expect(container).toHaveCSS('background-image', await tintLayer(field));
            });

            test('clearing the forced state puts the field back', async ({ page }) => {
                const { field, container } = await autofill(page, 'state_default');

                await expect(container).toHaveCSS('background-image', await tintLayer(field));

                await e2eClearForcedAutofill(page);

                // Guards the helper itself: a forced state is keyed to the node id it was set on,
                // and `DOM.getDocument` re-issues ids, so a clear that addresses a fresh id looks
                // like it worked and changes nothing.
                await expect(container).toHaveCSS('background-image', 'none');
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

            test('the control block suppresses the background and repaints the text', async ({ page }) => {
                const rules = await readRules(page);
                const block = rules.find((rule) => rule.text.includes('transition-property: background-color'));

                expect(block).toBeDefined();

                for (const control of ['.kbq-input', '.kbq-tag-input', '.kbq-textarea']) {
                    expect(block!.selector).toContain(control);
                }

                // Both spellings, through a forgiving list: a plain comma list would be invalidated
                // whole by whichever of the two a browser does not know.
                expect(block!.selector).toContain(':autofill');
                expect(block!.selector).toContain(':-webkit-autofill');
                // The tint belongs to the container, and nothing paints the control itself.
                expect(block!.text).not.toContain('box-shadow');
                expect(block!.text).not.toContain('background-color:');
            });

            test('the text repaint is one low-specificity rule, not one per state', async ({ page }) => {
                const rules = await readRules(page);
                // Scoped to autofill: the error and disabled states also repaint an icon through
                // `-webkit-text-fill-color`, and those have nothing to do with this.
                const repaints = rules.filter(
                    (rule) => rule.text.includes('-webkit-text-fill-color') && rule.selector.includes('autofill')
                );

                // Emitting the repaint inside `_kbq-form-field-state()` compiled to 84 selectors —
                // the mixin runs five times, once nested under eight `kbq-form-field-type-*`
                // classes — and gave a text colour a specificity of (0,7,0), which a consumer could
                // only override with `!important`. One rule reading a variable the state publishes
                // does the same job at (0,3,0). The bound is what this test is for; the exact count
                // is allowed to grow a little, three orders of magnitude is not.
                expect(repaints.length).toBeLessThanOrEqual(2);

                const classesInSelector = (selector: string) => (selector.match(/\.[a-z][\w-]*/gi) ?? []).length;
                const worst = Math.max(...repaints.flatMap((rule) => rule.selector.split(',').map(classesInSelector)));

                expect(worst).toBeLessThanOrEqual(3);
            });

            test('no rule gives an autofilled control its own geometry', async ({ page }) => {
                const rules = await readRules(page);

                // DS-4950's compensation is gone with the background it was compensating for. If it
                // ever comes back, the control resizes on focus again and tag inputs are excluded
                // from it again by `tag-list.scss`.
                expect(
                    rules.filter((rule) => rule.selector.includes('autofill') && /min-height|margin/.test(rule.text))
                ).toEqual([]);
            });

            test('the container block lays the tint over the state background', async ({ page }) => {
                const rules = await readRules(page);
                // Both halves are load-bearing. `:has(` alone also matches the focused state's text
                // rule, nested under `:not(:has(.cdk-keyboard-focused, .kbq-focused))`; the
                // container prefix alone also matches the padding rule keyed on
                // `__container:has(.kbq-textarea)`. Both come first in document order.
                const block = findRule(
                    rules,
                    (selector) => selector.includes('.kbq-form-field__container:has(') && selector.includes('autofill')
                );

                expect(block).toBeDefined();
                expect(block!.selector).toContain('.kbq-textarea');
                // The tint is a layer, so `background-color` stays with the state and no
                // `!important` is needed to make it land. Both halves matter: painting
                // `background-color` here is what DS-4060 did, and it is what out-ranked error,
                // disabled and the overlay.
                expect(block!.text).toContain('background-image');
                expect(block!.text).not.toContain('background-color:');
                expect(block!.text).not.toContain('!important');
            });

            test('no modifier has to remap the autofill background', async ({ page }) => {
                const rules = await readRules(page);
                const remaps = rules.filter(
                    (rule) =>
                        /_no-borders|_without-borders|_in-overlay/.test(rule.selector) &&
                        rule.text.includes('--kbq-form-field-states-autofill-background')
                );

                // `_in-overlay` remaps the four state backgrounds and never mentions autofill. Under
                // the old rule that was the bug; under a layer it is the correct amount of work —
                // the tint composites over whatever the modifier left behind.
                expect(remaps).toEqual([]);
            });

            test('background is the only autofill token anything reads', async ({ page }) => {
                const rules = await readRules(page);
                const reads = (token: string) => rules.filter((rule) => rule.text.includes(`var(${token})`));

                // Reads rather than declarations: `@koobiq/design-tokens` still publishes all four
                // names on `.kbq-light`/`.kbq-dark` — it deprecates them upstream, on its own
                // schedule — so what the component dropped can only be seen from the consuming side.
                //
                // `-border-color` aliased the focus colour and made a merely filled field read as
                // focused, `-placeholder` could never be seen because an autofilled field has a
                // value, and `-text` forced one colour on every state.
                expect(reads('--kbq-form-field-states-autofill-border-color')).toEqual([]);
                expect(reads('--kbq-form-field-states-autofill-placeholder')).toEqual([]);
                expect(reads('--kbq-form-field-states-autofill-text')).toEqual([]);
                expect(reads('--kbq-form-field-states-autofill-background').length).toBeGreaterThan(0);
            });

            test('every autofill selector carries both spellings', async ({ page }) => {
                const rules = await readRules(page);
                const autofillRules = rules.filter(
                    (rule) => rule.selector.includes('autofill') && rule.selector.includes('kbq-')
                );

                expect(autofillRules.length).toBeGreaterThan(0);

                // The legacy spelling is what browsers implement today and the standard one is where
                // they are going; a forgiving `:is()` list keeps whichever a given browser knows,
                // where a plain comma list would be invalidated whole by the other.
                for (const rule of autofillRules) {
                    expect(rule.selector).toMatch(/(^|[^-]):autofill\b/);
                    expect(rule.selector).toContain(':-webkit-autofill');
                }
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
             * animation with a finite end time — and the 600000s `background-color` transition that
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

                expect(await e2eRunningAnimations(control)).toEqual([['background-color', 600_000_000]]);
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
