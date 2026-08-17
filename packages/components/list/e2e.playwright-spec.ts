import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqListModule', () => {
    test.describe('E2eListStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eListStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eListStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eListSelectionState', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eListSelectionState');

        test('selected disabled option', async ({ page }) => {
            await page.goto('/E2eListSelectionState');
            const component = getComponent(page);

            await expect(component).toHaveScreenshot('02-light.png');
        });
    });

    test.describe('E2eListOptionActionVisibility', () => {
        const getOptionAction = (page: Page, option: string) =>
            page.getByTestId(option).locator('.kbq-action-container');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eListOptionActionVisibility');
        });

        test('reveals the action on hover only', async ({ page }) => {
            await expect(getOptionAction(page, 'option-1')).toBeHidden();

            await page.getByTestId('option-1').hover();
            await expect(getOptionAction(page, 'option-1')).toBeVisible();

            await page.mouse.move(0, 0);
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('hides the action of a mouse-focused option once the pointer leaves', async ({ page }) => {
            await page.getByTestId('option-1').click();
            await page.mouse.move(0, 0);

            // The option keeps `kbq-focused` (it is `tabindex="-1"` and a click focuses it), but the
            // action must not stay behind — the reveal is gated on `cdk-keyboard-focused`.
            await expect(page.getByTestId('option-1')).toHaveClass(/kbq-focused/);
            await expect(page.getByTestId('e2eList')).not.toHaveClass(/cdk-keyboard-focused/);
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('shows the action of exactly one option at a time', async ({ page }) => {
            await page.getByTestId('option-1').click();
            await page.getByTestId('option-2').hover();

            await expect(getOptionAction(page, 'option-2')).toBeVisible();
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('reveals the action of the keyboard-focused option', async ({ page }) => {
            await page.keyboard.press('Tab');

            await expect(page.getByTestId('e2eList')).toHaveClass(/cdk-keyboard-focused/);
            await expect(page.getByTestId('option-1')).toHaveClass(/kbq-focused/);
            await expect(getOptionAction(page, 'option-1')).toBeVisible();

            await page.keyboard.press('ArrowDown');

            await expect(getOptionAction(page, 'option-2')).toBeVisible();
            await expect(getOptionAction(page, 'option-1')).toBeHidden();
        });

        test('does not pin the action when Tab cannot reach it', async ({ page }) => {
            await page.getByTestId('option-1').click();
            await page.mouse.move(0, 0);

            await page.keyboard.press('Tab');

            await expect(getOptionAction(page, 'option-1')).toBeHidden();
            await expect(page.getByTestId('option-1')).not.toHaveClass(/kbq-action-button-focused/);
        });

        test('opens the action dropdown with the keyboard alone', async ({ page }) => {
            await page.keyboard.press('Tab');
            // Second Tab moves focus from the option onto its now-visible action.
            await page.keyboard.press('Tab');

            await expect(page.getByTestId('option-1').locator('kbq-option-action')).toBeFocused();

            await page.keyboard.press('Enter');

            await expect(page.getByTestId('dropdownItem')).toBeVisible();
        });

        test('keeps the action visible while its dropdown is open and after it closes', async ({ page }) => {
            // The action is only clickable once the option is hovered — that is the whole point.
            await page.getByTestId('option-1').hover();
            await page.getByTestId('option-1').locator('kbq-option-action').click();
            await expect(page.getByTestId('dropdownItem')).toBeVisible();

            // The pointer is off the option, so only the `kbq-action-button-focused` latch keeps it up.
            await page.mouse.move(0, 0);
            await expect(getOptionAction(page, 'option-1')).toBeVisible();

            // On close the action is re-focused, so it must stay visible — otherwise focus would
            // land on an invisible control (WCAG 2.4.7).
            await page.getByTestId('dropdownItem').click();
            await expect(page.getByTestId('dropdownItem')).toBeHidden();
            await expect(page.getByTestId('option-1')).toHaveClass(/kbq-action-button-focused/);
            await expect(getOptionAction(page, 'option-1')).toBeVisible();
        });
    });

    test.describe('E2eListDragAndDrop', () => {
        // The suite runs with `reducedMotion: 'reduce'`, which would make the settling assertion below
        // pass without ever exercising a transition.
        test.use({ reducedMotion: 'no-preference' });

        const getLabels = (page: Page, list: string) =>
            page.getByTestId(list).locator('kbq-list-option .kbq-list-text').allInnerTexts();

        /**
         * CDK only starts a drag past its 5px threshold, and only sorts once the pointer actually
         * moves — hence the stepped move rather than a single jump.
         */
        const pressAndMoveOnto = async (page: Page, from: string, to: string) => {
            const sourceBox = (await page.getByTestId(from).boundingBox())!;
            const targetBox = (await page.getByTestId(to).boundingBox())!;
            const startX = sourceBox.x + sourceBox.width / 2;
            const startY = sourceBox.y + sourceBox.height / 2;
            const endX = targetBox.x + targetBox.width / 2;
            const endY = targetBox.y + targetBox.height / 2;

            await page.mouse.move(startX, startY);
            await page.mouse.down();

            for (let step = 1; step <= 10; step++) {
                await page.mouse.move(startX + ((endX - startX) * step) / 10, startY + ((endY - startY) * step) / 10, {
                    steps: 2
                });
            }
        };

        /**
         * The drop is asynchronous: CDK emits `cdkDropListDropped` only after the preview has animated
         * onto the placeholder, so wait for the preview to be gone before asserting.
         */
        const dragOnto = async (page: Page, from: string, to: string) => {
            await pressAndMoveOnto(page, from, to);
            await page.mouse.up();
            await expect(page.locator('.cdk-drag-preview')).toHaveCount(0);
        };

        /** Samples `label@top` of every option once per animation frame for `duration` ms. */
        const sampleFrames = (page: Page, list: string, duration: number) =>
            page.evaluate(
                ([testId, ms]) =>
                    new Promise<string[]>((resolve) => {
                        const container = document.querySelector(`[data-testid="${testId}"]`)!;
                        const frames: string[] = [];
                        const start = performance.now();
                        const tick = () => {
                            frames.push(
                                [...container.querySelectorAll('kbq-list-option')]
                                    .map((o) => `${o.textContent!.trim()}@${Math.round(o.getBoundingClientRect().top)}`)
                                    .join(' ')
                            );

                            if (performance.now() - start < (ms as number)) {
                                requestAnimationFrame(tick);
                            } else {
                                resolve(frames);
                            }
                        };

                        requestAnimationFrame(tick);
                    }),
                [list, duration] as const
            );

        /**
         * Has to outlast both drag transitions declared in `list.scss` — the 250ms sort transition and
         * the 300ms `.cdk-drag-animating` reset — with room to spare on a frame-throttled CI machine.
         * Keep in sync with those durations.
         */
        const settlingDuration = 700;

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eListDragAndDrop');
        });

        test('reorders options by dragging within one list', async ({ page }) => {
            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-1', 'source-2', 'source-3']);

            await dragOnto(page, 'source-1', 'source-3');

            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-2', 'source-3', 'source-1']);
        });

        test('settles into the new order without sliding into place', async ({ page }) => {
            await pressAndMoveOnto(page, 'source-1', 'source-3');

            const sampling = sampleFrames(page, 'e2eSourceList', settlingDuration);

            await page.mouse.up();

            const frames = await sampling;
            const settled = frames.at(-1)!;
            // Once the consumer has applied the move, the options are already where they belong. If the
            // sort transforms are reset with a transition still live, the reset animates on top of the
            // new DOM order and every option below the dropped one visibly slides — those frames carry
            // the new order but the old offsets.
            const reordered = frames.filter((frame) => frame.startsWith('source-2'));

            expect(reordered.length).toBeGreaterThan(0);
            expect([...new Set(reordered)]).toEqual([settled]);
        });

        test('does not select the option that was dragged', async ({ page }) => {
            await dragOnto(page, 'source-1', 'source-3');

            // A drag ends with a `mouseup` over the option, which must not read as a click-to-select.
            await expect(page.getByTestId('e2eSourceList').locator('.kbq-selected')).toHaveCount(0);
        });

        test('still selects on a plain click', async ({ page }) => {
            await page.getByTestId('source-1').click();

            await expect(page.getByTestId('source-1')).toHaveClass(/kbq-selected/);
        });

        test('moves an option into the connected list', async ({ page }) => {
            await dragOnto(page, 'source-1', 'target-1');

            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-2', 'source-3']);
            expect(await getLabels(page, 'e2eTargetList')).toContain('source-1');
        });

        test('reorders with the keyboard alone', async ({ page }) => {
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('source-1')).toHaveClass(/kbq-focused/);

            await page.keyboard.press('Alt+ArrowDown');

            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-2', 'source-1', 'source-3']);
            // Focus has to follow the option it moved, otherwise the next keypress acts on a different row.
            await expect(page.getByTestId('source-1')).toBeFocused();
            // CDK keeps a single live region on `<body>`: a listbox may only contain options.
            await expect(page.locator('.cdk-live-announcer-element')).toHaveText(/source-1.*2.*3/);
        });

        test('transfers to the connected list with the keyboard alone', async ({ page }) => {
            await page.keyboard.press('Tab');
            await page.keyboard.press('Alt+ArrowRight');

            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-2', 'source-3']);
            expect(await getLabels(page, 'e2eTargetList')).toEqual(['target-1', 'source-1']);
            await expect(page.getByTestId('source-1')).toBeFocused();
        });
    });
});
