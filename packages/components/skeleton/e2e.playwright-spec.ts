import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

const host = (page: Page, state: 'loading' | 'loaded', testId: string): Locator =>
    page.getByTestId(state).getByTestId(testId);

const radius = (locator: Locator): Promise<string> =>
    locator.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);

// Read from the host rather than hardcoded, so a new value of the token does not fail the test.
const skeletonRadius = (locator: Locator): Promise<string> =>
    locator.evaluate((element) => getComputedStyle(element).getPropertyValue('--kbq-skeleton-border-radius').trim());

// Boxes of the elements that match `selector`, relative to the element of `locator`.
const boxesIn = (locator: Locator, selector: string): Promise<number[][]> =>
    locator.evaluate((host, selector) => {
        const origin = host.getBoundingClientRect();

        return Array.from(host.querySelectorAll(selector), (element) => {
            const { left, top, width, height } = element.getBoundingClientRect();

            return [left - origin.left, top - origin.top, width, height];
        });
    }, selector);

// Rounded to a pixel: a glyph of the icon font is a fraction of a pixel narrower than the box of its icon.
const centers = (boxes: number[][]): number[][] =>
    boxes.map(([left, top, width, height]) => [Math.round(left + width / 2), Math.round(top + height / 2)]);

const pitch = (values: number[]): number[] => values.slice(1).map((value, index) => value - values[index]);

const dimensions = (locator: Locator): Promise<[number, number]> =>
    locator.evaluate((element) => {
        const { width, height } = element.getBoundingClientRect();

        return [width, height];
    });

test.describe('KbqSkeleton', () => {
    // The screenshots run with reduced motion, so the wave stands still and every skeleton shows only its fill.
    test.describe('screenshots', () => {
        test('of the directive on text and on a component, and of the element', async ({ page }) => {
            await page.goto('/E2eSkeletonStates');
            const locator = page.getByTestId('e2eSkeletonStates');

            await expect(locator).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(locator).toHaveScreenshot('01-dark.png');
        });

        test('of every preset', async ({ page }) => {
            await page.goto('/E2eSkeletonPresetList');

            await expect(page.getByTestId('e2eSkeletonPresetList')).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('border radius', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSkeletonBorderRadius');
        });

        test('should keep the radius of a host that has one', async ({ page }) => {
            for (const testId of ['own', 'button', 'alert', 'form-field']) {
                const own = await radius(host(page, 'loaded', testId));

                // Guards the fixture: a host without a radius of its own would prove nothing here.
                expect.soft(own, testId).not.toBe('0px');
                expect.soft(await radius(host(page, 'loading', testId)), testId).toBe(own);
            }
        });

        test('should give the skeleton radius to a host that has none', async ({ page }) => {
            for (const testId of ['text', 'block', 'element']) {
                const loading = host(page, 'loading', testId);
                const expected = await skeletonRadius(loading);

                expect.soft(expected, testId).not.toBe('0px');
                expect.soft(await radius(loading), testId).toBe(expected);
            }
        });

        test('should give a host its own radius back once loaded', async ({ page }) => {
            for (const testId of ['text', 'block']) {
                expect.soft(await radius(host(page, 'loaded', testId)), testId).toBe('0px');
            }
        });

        test('should keep an explicit zero radius', async ({ page }) => {
            expect(await radius(host(page, 'loading', 'square'))).toBe('0px');
        });

        test('should let a class override the radius of the kbq-skeleton element', async ({ page }) => {
            expect(await radius(host(page, 'loading', 'circle'))).toBe('50%');
        });
    });

    test.describe('presets', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSkeletonPresets');
        });

        test('should give an element preset the size of the component it stands in for', async ({ page }) => {
            const sizes = { button: [72, 32], badge: [56, 24], tag: [56, 24], icon: [24, 24], link: [32, 20] };

            for (const [testId, size] of Object.entries(sizes)) {
                expect.soft(await dimensions(page.getByTestId(testId)), testId).toEqual(size);
            }
        });

        test('should stretch a standalone skeleton across a block at the height of a class', async ({ page }) => {
            const [width] = await dimensions(page.getByTestId('block-container'));

            expect(await dimensions(page.getByTestId('block'))).toEqual([width, 100]);
        });

        test('should take the height of the text of its typography level', async ({ page }) => {
            for (const testId of ['heading', 'paragraph', 'compact']) {
                const [, height] = await dimensions(page.getByTestId(testId));

                expect.soft(height, testId).toBe((await dimensions(page.getByTestId(`real-${testId}`)))[1]);
            }
        });

        test('should draw every line of the text a gap shorter than the line of its level', async ({ page }) => {
            const heading = page.getByTestId('heading');
            const [width, height] = await dimensions(heading);
            const gap = await heading.evaluate((element) =>
                parseFloat(getComputedStyle(element).getPropertyValue('--kbq-skeleton-typography-gap'))
            );

            // A single line, such as a heading, takes half of the width.
            expect(await dimensions(heading.locator('.kbq-skeleton'))).toEqual([width / 2, height - gap]);
        });

        test('should let a class resize a preset', async ({ page }) => {
            expect.soft(await dimensions(page.getByTestId('wide-button'))).toEqual([120, 32]);
            expect.soft((await dimensions(page.getByTestId('narrow-paragraph')))[0]).toBe(300);
        });

        test('should repeat the lengths of the lines of a paragraph', async ({ page }) => {
            const paragraph = page.getByTestId('paragraph');
            const [width] = await dimensions(paragraph);
            const lines = await paragraph
                .locator('.kbq-skeleton')
                .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));

            expect(lines.map((line) => Math.round((line / width) * 100))).toEqual([80, 100, 60, 80]);
        });

        test('should keep the rows of a description list', async ({ page }) => {
            const tops = (locator: Locator) =>
                locator.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));

            const terms = page.getByTestId('dl').locator('.kbq-skeleton-dl__term');
            const realTerms = page.getByTestId('real-dl').locator('kbq-dt');

            expect(pitch(await tops(terms))).toEqual(pitch(await tops(realTerms)));
            expect((await dimensions(terms.first()))[0]).toBe(120);
        });

        test('should keep the rows of a table', async ({ page }) => {
            const table = page.getByTestId('table');
            const realTable = page.getByTestId('real-table');

            expect.soft(await dimensions(table.locator('.kbq-skeleton-table__cell_header').first())).toEqual([
                expect.any(Number),
                (await dimensions(realTable.locator('th')))[1]
            ]);
            expect.soft(await dimensions(table.locator('.kbq-skeleton-table__cell').last())).toEqual([
                expect.any(Number),
                (await dimensions(realTable.locator('td').first()))[1]
            ]);
        });

        test('should keep the lines of a form field', async ({ page }) => {
            const boxes = (locator: Locator, parts: Record<string, string>) =>
                locator.evaluate((host, parts) => {
                    const origin = host.getBoundingClientRect();

                    return Object.fromEntries(
                        Object.entries(parts).map(([name, selector]) => {
                            const { left, top, width, height } = host.querySelector(selector)!.getBoundingClientRect();

                            return [name, [left - origin.left, top - origin.top, width, height]];
                        })
                    );
                }, parts);

            for (const layout of ['horizontal', 'vertical', 'textarea']) {
                const preset = await boxes(page.getByTestId(`form-field-${layout}`), {
                    label: '.kbq-skeleton-form-field__label',
                    control: '.kbq-skeleton-form-field__control',
                    hint: '.kbq-skeleton-form-field__hint'
                });
                const real = await boxes(page.getByTestId(`real-form-field-${layout}`), {
                    label: '.kbq-form-field__label',
                    control: '.kbq-form-field__container',
                    hint: '.kbq-form-field__hint'
                });

                expect.soft(preset.label, layout).toEqual(real.label);
                expect.soft(preset.control, layout).toEqual(real.control);
                // The hint is a shorter line than its container: only where it starts is compared.
                expect.soft(preset.hint.slice(0, 2), layout).toEqual(real.hint.slice(0, 2));
            }
        });

        test('should draw a form field without a label as its control alone', async ({ page }) => {
            const preset = page.getByTestId('form-field-bare');
            const real = page.getByTestId('real-form-field-bare');

            expect
                .soft(await boxesIn(preset, '.kbq-skeleton-form-field__control'))
                .toEqual(await boxesIn(real, '.kbq-form-field__container'));
            expect.soft(await dimensions(preset)).toEqual(await dimensions(real));
        });

        test('should give the table columns their own widths', async ({ page }) => {
            const cells = page.getByTestId('table-widths').locator('.kbq-skeleton-table__cell');

            expect.soft((await dimensions(cells.first()))[0]).toBe(160);
            expect.soft((await dimensions(cells.last()))[0]).toBe(48);
        });
    });

    test.describe('component presets', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSkeletonComponentPresets');
        });

        test('should keep the items of an accordion', async ({ page }) => {
            const preset = page.getByTestId('accordion');
            const real = page.getByTestId('real-accordion');

            expect
                .soft(await boxesIn(preset, '.kbq-skeleton-accordion__item'))
                .toEqual(await boxesIn(real, '.kbq-accordion-item'));
            expect
                .soft(centers(await boxesIn(preset, '.kbq-skeleton-accordion__icon')))
                .toEqual(centers(await boxesIn(real, '.kbq-accordion-trigger__icon')));
        });

        test('should keep the control and the lines of a checkbox, a radio button and a toggle', async ({ page }) => {
            const parts = {
                checkbox: ['.kbq-checkbox__frame', '.kbq-checkbox__text-container'],
                radio: ['.kbq-radio-button__outer-circle', '.kbq-radio__text-container'],
                toggle: ['.kbq-toggle-bar', '.kbq-toggle__content']
            };

            for (const [control, [realControl, realText]] of Object.entries(parts)) {
                const preset = page.getByTestId(control);
                const real = page.getByTestId(`real-${control}`);
                // The text of the component is as wide as its words: only where its lines are is compared.
                const lines = (boxes: number[][]) => boxes.map(([left, top, , height]) => [left, top, height]);

                expect
                    .soft(await boxesIn(preset, '.kbq-skeleton-checkable__control'), control)
                    .toEqual(await boxesIn(real, realControl));
                expect
                    .soft(lines(await boxesIn(preset, '.kbq-skeleton-checkable__text')), control)
                    .toEqual(lines(await boxesIn(real, realText)));
            }
        });

        test('should keep the height of the tabs and the rows of stacked ones', async ({ page }) => {
            const heights = (boxes: number[][]) => boxes.map(([, , , height]) => height);
            const tops = (boxes: number[][]) => boxes.map(([, top]) => top);

            expect
                .soft(heights(await boxesIn(page.getByTestId('tabs'), '.kbq-skeleton-tabs__tab')))
                .toEqual(heights(await boxesIn(page.getByTestId('real-tabs'), '.kbq-tab-label')));
            expect
                .soft(pitch(tops(await boxesIn(page.getByTestId('vertical-tabs'), '.kbq-skeleton-tabs__tab'))))
                .toEqual(pitch(tops(await boxesIn(page.getByTestId('real-vertical-tabs'), '.kbq-tab-label'))));
        });

        test('should keep the nodes of a tree and the toggles of every level', async ({ page }) => {
            const preset = page.getByTestId('tree');
            const real = page.getByTestId('real-tree');

            expect
                .soft(await boxesIn(preset, '.kbq-skeleton-tree__node'))
                .toEqual(await boxesIn(real, 'kbq-tree-option'));
            expect
                .soft(centers(await boxesIn(preset, '.kbq-skeleton-tree__toggle')))
                .toEqual(centers(await boxesIn(real, 'kbq-tree-node-toggle')));
        });
    });
});
