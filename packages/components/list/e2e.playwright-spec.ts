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
        const getLabels = (page: Page, list: string) =>
            page.getByTestId(list).locator('kbq-list-option .kbq-list-text').allInnerTexts();

        /**
         * CDK only starts a drag past its 5px threshold, hence the stepped move rather than a single
         * jump. The pointer stops past the target's midpoint rather than on it: the midpoint is exactly
         * the boundary between the gap above the target and the gap below it, so aiming at the centre
         * would leave the resulting position ambiguous. `at` picks the side — below the midpoint by
         * default, above it for a drop that has to land before the target.
         */
        const pressAndMoveOnto = async (page: Page, from: string, to: string, at = 0.75) => {
            const sourceBox = (await page.getByTestId(from).boundingBox())!;
            const targetBox = (await page.getByTestId(to).boundingBox())!;
            const startX = sourceBox.x + sourceBox.width / 2;
            const startY = sourceBox.y + sourceBox.height / 2;
            const endX = targetBox.x + targetBox.width / 2;
            const endY = targetBox.y + targetBox.height * at;

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

        /** Reads `label@top` of every option in the list — the layout the drag must never disturb. */
        const readLayout = (page: Page, list: string) =>
            page
                .getByTestId(list)
                .evaluate((container) =>
                    [...container.querySelectorAll('kbq-list-option')]
                        .map(
                            (option) =>
                                `${option.textContent!.trim()}@${Math.round(option.getBoundingClientRect().top)}`
                        )
                        .join(' ')
                );

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

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eListDragAndDrop');
        });

        test('reorders options by dragging within one list', async ({ page }) => {
            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-1', 'source-2', 'source-3']);

            await dragOnto(page, 'source-1', 'source-3');

            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-2', 'source-3', 'source-1']);
        });

        test('never moves the surrounding options while dragging', async ({ page }) => {
            const atRest = await readLayout(page, 'e2eSourceList');

            const sampling = sampleFrames(page, 'e2eSourceList', 400);

            await pressAndMoveOnto(page, 'source-1', 'source-3');

            // The target position is shown by the indicator, so the list itself must stay perfectly
            // still: no option may be nudged aside to open a gap at any point during the drag.
            expect([...new Set(await sampling)]).toEqual([atRest]);

            await page.mouse.up();
        });

        test('swaps the grab cursor for grabbing while the option is being dragged', async ({ page }) => {
            // Read it off the option the pointer ends over, not off the body: CDK hides the preview from
            // hit testing, so the cursor the user sees is the one resolved from whatever lies under it.
            // `source-3` is never cloned during the drag, unlike the option being dragged.
            const cursorUnderPointer = () =>
                page.getByTestId('source-3').evaluate((option) => getComputedStyle(option).cursor);

            expect(await cursorUnderPointer()).toBe('grab');

            await pressAndMoveOnto(page, 'source-1', 'source-3');

            expect(await cursorUnderPointer()).toBe('grabbing');

            await page.mouse.up();
            await expect(page.locator('.cdk-drag-preview')).toHaveCount(0);

            expect(await cursorUnderPointer()).toBe('grab');
        });

        test('stops the options from reacting to hover while one is being dragged', async ({ page }) => {
            const backgroundOf = (testId: string) =>
                page.getByTestId(testId).evaluate((option) => getComputedStyle(option).backgroundColor);

            await page.getByTestId('source-2').hover();
            const hovered = await backgroundOf('source-2');

            await page.mouse.move(0, 0);
            const atRest = await backgroundOf('source-2');

            // Without this the assertion below would also pass on a list that never highlights at all.
            expect(hovered).not.toBe(atRest);

            await pressAndMoveOnto(page, 'source-1', 'source-2');

            expect(await backgroundOf('source-2')).toBe(atRest);

            await page.mouse.up();
        });

        test('turns the cursor to no-drop away from any list that would take the option', async ({ page }) => {
            const bodyCursor = () => page.evaluate(() => getComputedStyle(document.body).cursor);

            await pressAndMoveOnto(page, 'source-1', 'source-3');

            expect(await bodyCursor()).toBe('grabbing');

            // The lists sit at the top left of the page, so the bottom right corner is outside both.
            const viewport = page.viewportSize()!;

            await page.mouse.move(viewport.width - 1, viewport.height - 1, { steps: 5 });

            expect(await bodyCursor()).toBe('no-drop');

            // Back over the list — a plain move, the button is still down from the drag above.
            const target = (await page.getByTestId('source-3').boundingBox())!;

            await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 5 });

            expect(await bodyCursor()).toBe('grabbing');

            await page.mouse.up();
        });

        test('marks the drop target with the insertion indicator', async ({ page }) => {
            const indicator = page.getByTestId('e2eSourceList').locator('.kbq-list-selection__drop-indicator');

            await expect(indicator).toHaveCount(0);

            await pressAndMoveOnto(page, 'source-1', 'source-3');

            await expect(indicator).toBeVisible();

            // Dropping past the midpoint of the last option puts the indicator at the list's end.
            const lastOption = (await page.getByTestId('source-3').boundingBox())!;
            const indicatorBox = (await indicator.boundingBox())!;

            expect(Math.abs(indicatorBox.y - (lastOption.y + lastOption.height))).toBeLessThanOrEqual(2);

            await page.mouse.up();
            await expect(indicator).toHaveCount(0);
        });

        test('shows no indicator over the place the option already occupies', async ({ page }) => {
            // Above the midpoint of the option below it, which is the gap `source-1` is already in.
            await pressAndMoveOnto(page, 'source-1', 'source-2', 0.25);

            // Without this the assertion below would also pass on a drag that never started.
            await expect(page.locator('.cdk-drag-preview')).toHaveCount(1);
            await expect(page.getByTestId('e2eSourceList').locator('.kbq-list-selection__drop-indicator')).toHaveCount(
                0
            );

            await page.mouse.up();
        });

        test('keeps the dragged option in place, faded, instead of removing it', async ({ page }) => {
            await pressAndMoveOnto(page, 'source-1', 'source-3');

            // The row stays where it was so the list does not jump when the drag begins.
            expect(await getLabels(page, 'e2eSourceList')).toEqual(['source-1', 'source-2', 'source-3']);
            await expect(page.getByTestId('e2eSourceList').locator('.cdk-drag-placeholder')).toHaveCount(1);

            await page.mouse.up();
        });

        test('moves the indicator into the connected list when hovering it', async ({ page }) => {
            await pressAndMoveOnto(page, 'source-1', 'target-1');

            await expect(
                page.getByTestId('e2eTargetList').locator('.kbq-list-selection__drop-indicator')
            ).toBeVisible();
            await expect(page.getByTestId('e2eSourceList').locator('.kbq-list-selection__drop-indicator')).toHaveCount(
                0
            );

            await page.mouse.up();
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
    });

    test.describe('E2eListDragHandle', () => {
        const getLabels = (page: Page) =>
            page.getByTestId('e2eHandleList').locator('kbq-list-option .kbq-list-text').allInnerTexts();

        const handleOf = (page: Page, option: string) => page.getByTestId(option).locator('.cdk-drag-handle');

        /**
         * Same stepped move as the suite above, but aimed at arbitrary elements so that the row and its
         * handle can be pressed separately.
         */
        const pressAndMoveFrom = async (page: Page, from: Locator, to: Locator) => {
            const fromBox = (await from.boundingBox())!;
            const toBox = (await to.boundingBox())!;
            const startX = fromBox.x + fromBox.width / 2;
            const startY = fromBox.y + fromBox.height / 2;
            const endX = toBox.x + toBox.width / 2;
            const endY = toBox.y + toBox.height * 0.75;

            await page.mouse.move(startX, startY);
            await page.mouse.down();

            for (let step = 1; step <= 10; step++) {
                await page.mouse.move(startX + ((endX - startX) * step) / 10, startY + ((endY - startY) * step) / 10, {
                    steps: 2
                });
            }
        };

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eListDragHandle');
        });

        test('starts a drag from the handle', async ({ page }) => {
            await pressAndMoveFrom(page, handleOf(page, 'handle-1'), page.getByTestId('handle-3'));
            await expect(page.locator('.cdk-drag-preview')).toHaveCount(1);

            await page.mouse.up();
            await expect(page.locator('.cdk-drag-preview')).toHaveCount(0);

            expect(await getLabels(page)).toEqual(['handle-2', 'handle-3', 'handle-1']);
        });

        test('ignores a drag started from the rest of the row', async ({ page }) => {
            // The row's own centre is the label: the handle has taken the drag away from it.
            await pressAndMoveFrom(page, page.getByTestId('handle-1'), page.getByTestId('handle-3'));

            await expect(page.locator('.cdk-drag-preview')).toHaveCount(0);

            await page.mouse.up();

            expect(await getLabels(page)).toEqual(['handle-1', 'handle-2', 'handle-3']);
        });

        test('advertises the grab on the handle rather than on the row', async ({ page }) => {
            const cursorOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).cursor);

            expect(await cursorOf(handleOf(page, 'handle-1'))).toBe('grab');
            expect(await cursorOf(page.getByTestId('handle-1'))).toBe('pointer');
        });
    });

    test.describe('E2eListDragGrouped', () => {
        const getLabels = (page: Page) =>
            page.getByTestId('e2eGroupedList').locator('kbq-list-option .kbq-list-text').allInnerTexts();

        /** Rows 3 to 5 sit inside the group, rows 6 and 7 below the divider. */
        const dragOnto = async (page: Page, from: string, to: string) => {
            const fromBox = (await page.getByTestId(from).boundingBox())!;
            const toBox = (await page.getByTestId(to).boundingBox())!;
            const startX = fromBox.x + fromBox.width / 2;
            const startY = fromBox.y + fromBox.height / 2;
            const endX = toBox.x + toBox.width / 2;
            const endY = toBox.y + toBox.height * 0.75;

            await page.mouse.move(startX, startY);
            await page.mouse.down();

            for (let step = 1; step <= 10; step++) {
                await page.mouse.move(startX + ((endX - startX) * step) / 10, startY + ((endY - startY) * step) / 10, {
                    steps: 2
                });
            }

            await page.mouse.up();
            await expect(page.locator('.cdk-drag-preview')).toHaveCount(0);
        };

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eListDragGrouped');
        });

        test('numbers options across the group, not within it', async ({ page }) => {
            // Past the midpoint of the second option inside the group, so row-1 lands between row-4 and row-5.
            await dragOnto(page, 'row-1', 'row-4');

            expect(await getLabels(page)).toEqual(['row-2', 'row-3', 'row-4', 'row-1', 'row-5', 'row-6', 'row-7']);
        });

        test('moves an option out of the group', async ({ page }) => {
            await dragOnto(page, 'row-3', 'row-6');

            expect(await getLabels(page)).toEqual(['row-1', 'row-2', 'row-4', 'row-5', 'row-6', 'row-3', 'row-7']);
        });

        test('does not pick up an option that opts out', async ({ page }) => {
            const box = (await page.getByTestId('row-7').boundingBox())!;
            const targetBox = (await page.getByTestId('row-1').boundingBox())!;

            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();

            for (let step = 1; step <= 10; step++) {
                await page.mouse.move(box.x + box.width / 2, box.y + ((targetBox.y - box.y) * step) / 10, { steps: 2 });
            }

            await expect(page.locator('.cdk-drag-preview')).toHaveCount(0);

            await page.mouse.up();

            expect(await getLabels(page)).toEqual(['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6', 'row-7']);
        });
    });
    test.describe('E2eListDragPreview', () => {
        /** Picks an option up and holds it, without dropping — the preview only exists mid-drag. */
        const pickUp = async (page: Page, testId: string) => {
            const box = (await page.getByTestId(testId).boundingBox())!;
            const x = box.x + 20;
            const y = box.y + box.height / 2;

            await page.mouse.move(x, y);
            await page.mouse.down();

            for (let step = 1; step <= 10; step++) {
                await page.mouse.move(x, y + step * 4, { steps: 2 });
            }

            await expect(page.locator('.cdk-drag-preview')).toHaveCount(1);

            return page.locator('.cdk-drag-preview');
        };

        test('replaces the option with a plate of its text', async ({ page }) => {
            await page.goto('/E2eListDragPreview');
            const preview = await pickUp(page, 'plain');

            await expect(preview).toHaveClass(/kbq-list-drag-preview_text/);
            await expect(preview).toHaveText('Plain label');
            // Everything the row carries besides its text has to stay behind.
            await expect(preview.locator('kbq-pseudo-checkbox')).toHaveCount(0);
            await expect(preview.locator('.kbq-icon')).toHaveCount(0);
            await expect(preview.locator('kbq-option-action')).toHaveCount(0);

            await page.mouse.up();
        });

        test('puts the caption on a line of its own', async ({ page }) => {
            await page.goto('/E2eListDragPreview');
            const preview = await pickUp(page, 'captioned');

            await expect(preview.locator('.kbq-list-drag-preview__label')).toHaveText('Captioned label');
            await expect(preview.locator('.kbq-list-drag-preview__caption')).toHaveText('Caption of its own');

            await page.mouse.up();
        });

        test('caps the plate at its maximum width and cuts both lines off', async ({ page }) => {
            await page.goto('/E2eListDragPreview');
            const preview = await pickUp(page, 'long');

            expect((await preview.boundingBox())!.width).toBe(480);

            // A cap alone would also hold on text that happens to fit; this is the ellipsis itself.
            for (const line of ['label', 'caption']) {
                const overflow = await preview
                    .locator(`.kbq-list-drag-preview__${line}`)
                    .evaluate((element) => element.scrollWidth > element.clientWidth);

                expect(overflow).toBe(true);
            }

            await page.mouse.up();
        });

        test('leaves the option under the pointer unhighlighted', async ({ page }) => {
            await page.goto('/E2eListDragPreview');
            const resting = await page.getByTestId('captioned').evaluate((el) => getComputedStyle(el).backgroundColor);

            await page.getByTestId('captioned').hover();
            const hovered = await page.getByTestId('captioned').evaluate((el) => getComputedStyle(el).backgroundColor);

            // Otherwise the assertion below would hold on a list that never reacted to hover at all.
            expect(hovered).not.toBe(resting);

            await pickUp(page, 'plain');
            await page.mouse.move(
                (await page.getByTestId('captioned').boundingBox())!.x + 20,
                (await page.getByTestId('captioned').boundingBox())!.y + 10
            );

            const dragged = await page.getByTestId('captioned').evaluate((el) => getComputedStyle(el).backgroundColor);

            expect(dragged).toBe(resting);
            expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).toBe('grabbing');

            await page.mouse.up();
        });

        test('keeps the whole row when the list opts into the full preview', async ({ page }) => {
            await page.goto('/E2eListDragPreview');
            const rowWidth = (await page.getByTestId('full-1').boundingBox())!.width;
            const preview = await pickUp(page, 'full-1');

            await expect(preview).toHaveClass(/kbq-list-option/);
            await expect(preview.locator('kbq-pseudo-checkbox')).toHaveCount(1);
            expect((await preview.boundingBox())!.width).toBe(rowWidth);

            await page.mouse.up();
        });
    });
});
